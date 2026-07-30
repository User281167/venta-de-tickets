# Phase 0: Research — Admin Donation Dashboard

## 1. Existing Donation Module

**Location**: `backend/src/modules/donaciones/`

### Structure
```
donaciones/
├── donaciones.controller.ts   # createDonation, handleWebhook*, getStatus
├── donaciones.repository.ts   # CRUD: create, findByExternalReference, updateStateByExternalReference
├── donaciones.routes.ts       # POST /, POST /webhook/*, GET /:ref/status
├── donaciones.schema.ts       # Zod schemas for create, response, status, webhook
├── donaciones.service.ts      # createDonation, handleWebhook, getStatus
└── providers/
    ├── donation-provider.registry.ts  # Maps provider name → provider instance
    ├── donation-provider.types.ts     # Interfaces: DonationProvider, DonationPreferenceInput, etc.
    ├── mercadopago.donation.provider.ts
    └── epayco.donation.provider.ts
```

**Missing for this feature**:
- No admin-facing list/query endpoint (only query by externalReference)
- No repository methods for paginated lists, filtering by state/account, or search by name/email
- No cron job for expiry
- No notification integration with messaging module

### Prisma Model
```prisma
model Donation {
  id                String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  full_name         String?
  email             String?
  amountCents       Decimal         @map("amount_cents") @db.Decimal(12, 2)
  state             DonationStatus  @default(pending)
  account           DonationAccount
  externalReference String          @unique @map("external_reference") @db.VarChar(100)
  paymentId         String?
  metadata          Json?
  createdAt         DateTime        @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime        @updatedAt @map("updated_at") @db.Timestamptz

  @@index([state, account])
  @@map("donations")
}
```

### Status Enum
`pending → confirmed | rejected | cancelled`

**No expiry/cancellation mechanism exists today** — donations stay pending forever.

---

## 2. Admin Backend Patterns

### Admin Routes (`/api/admin/*`)
- Routed via `adminsRouter` in `backend/src/modules/admins/admins.routes.ts`
- Protected by `authMiddleware` + `adminMiddleware` (checks role === `'admin'`)
- Further authorization via `requireRole('admin')` around specific handlers
- All responses follow `{ data, total, page, limit }` pagination pattern

### Critical Issue: `super_admin` blocked by `adminMiddleware`
The current `adminMiddleware` allows only role `'admin'`. The `requireRole` middleware checks against passed roles. To support super_admin:

**Decision**: Extend `adminMiddleware` to include `'super_admin'` in allowed roles. Add a separate `requireRole('admin')` guard where scoping is needed.

### Admin Middleware Code
```ts
const ADMIN_ROLES = ['admin'];  // Must become ['admin', 'super_admin']
```

### Admin Controller Pattern
- Validates query params with Zod schemas
- Calls service layer
- Returns JSON with pagination metadata

---

## 3. Frontend Admin Patterns

### Current Structure
| Route | Page Component (app/) | Feature Code (features/) |
|-------|----------------------|--------------------------|
| `/admin/pagos` | `app/admin/pagos/page.tsx` → imports `<PaymentsList>` | `features/admin-payments/` |
| `/admin/pagos/[id]` | `app/admin/pagos/[id]/page.tsx` | `features/admin-payments/` |
| `/admin/usuarios` | `app/admin/usuarios/page.tsx` | `features/admin-users/` |

### Pattern for This Feature
```
frontend/
├── app/admin/donaciones/page.tsx                   # Page only — imports DonationsList
└── features/admin-donations/
    ├── api/admin-donations.queries.ts               # TanStack Query hooks + fetch
    ├── components/DonationsList.tsx                 # Main list component
    ├── components/DonationsTable.tsx                # Table + row actions (resend)
    ├── components/DonationsFilters.tsx              # Filter bar
    └── types/index.ts                               # TypeScript types
```

### authFetch Utility
`frontend/shared/api/admin-fetch.ts` — wraps fetch with auth token, used by all admin query files.

---

## 4. Messaging Module (Resend)

### Files
| File | Purpose |
|------|---------|
| `messaging.service.ts` | Functions: sendPaymentConfirmation, sendPaymentFailed, sendTicketConfirmation, etc. |
| `notifications/payment-notifications.ts` | Orchestrators: notifyPaymentConfirmed, notifyPaymentFailed, etc. |
| `templates/render-template.ts` | Reads HTML, replaces `{{variable}}` placeholders |
| `templates/payment-confirmed.html` | Example template — must create `donation-confirmed.html` |
| `messaging.client.ts` | Stub console client (not used in production) |

### Pattern to Add Donation Email
1. Create `templates/donation-confirmed.html` with `{{donorName}}`, `{{amount}}`, `{{accountName}}`, `{{donationDate}}`
2. Add `sendDonationConfirmation()` to `messaging.service.ts`
3. Add `notifyDonationConfirmed()` to a new `notifications/donation-notifications.ts`
4. Export from `index.ts`

### Rendering Logic
```ts
renderTemplate('donation-confirmed', {
  donorName: input.donorName,
  amount: formatCop(input.amountCents),
  accountName: input.accountName,
  donationDate: formatDate(input.donationDate),
});
```

---

## 5. Shared Job Infrastructure

### Current
```ts
// backend/src/shared/jobs.ts
const SWEEP_INTERVAL_MILLIS = 5 * 60 * 1000; // 5 min

export function startSweepJob() {
  timer = setInterval(runSweep, SWEEP_INTERVAL_MILLIS);
}

async function runSweep() {
  // sweeps expired payment reservations
  await sweepExpiredReservations();
}
```

**Decision**: Add a `DONATION_EXPIRY_INTERVAL = 20 * 60 * 1000` and a `runDonationExpiry()` alongside `runSweep`. The donation expiry runs every 20 min (matching `RESERVATION_EXPIRATION_INTERNAL_MILLIS`). Keep as separate function but call from same `startSweepJob` or add a new `startDonationExpiryJob`.

**Decision**: Add a new `startDonationExpiryJob()` that runs on `DONATION_EXPIRY_INTERVAL` (20 min). Keep it separate from the sweep job for clarity, but call both from the same startup point.

---

## 6. Account Scoping for Admins

### Problem
No existing mechanism maps an admin user to a specific donation account.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| A) Env var `ADMIN_ACCOUNT` | Simple, fast, no schema changes | All admins share same scope; multi-admin per account not possible |
| B) User metadata field in users table | Flexible per admin; already has role field | Requires schema migration; overkill for current need |
| C) Derived from auth metadata | No DB change | Complex; Supabase metadata inconsistent with local DB |

**Decision**: Option A (env var) for v1. `super_admin` sees all. Regular admin reads `ADMIN_ACCOUNT` env var to scope. This matches Assumptions in spec.

---

## 7. Constitution Compliance Summary

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Layered Architecture | ✅ PASS | Donation admin routes follow existing patterns |
| II. Vertical Module Boundaries | ✅ PASS | New admin-donations logic stays in donation module + admins module |
| III. WhatsApp Bot | ✅ N/A | Not applicable |
| IV. Frontend Feature-Based | ✅ PASS | `features/admin-donations/` for code, `app/admin/donaciones/` for page |
| V. Shared Code Is Infrastructure | ✅ PASS | Only middleware/auth changes in shared/ |
| Tech Stack | ✅ Locked | No new dependencies |
| DB Conventions | ✅ PASS | No schema changes needed |

---

## 8. Key Design Decisions

1. **Admin endpoint location**: `/api/admin/donations` — following `adminsRouter` pattern, registered in `admins.routes.ts`
2. **Donation query logic**: New methods in `donaciones.repository.ts` (paginated findAll with filters)
3. **Cron approach**: New `startDonationExpiryJob()` in `jobs.ts` with 20-min interval
4. **Email approach**: New `donation-confirmed.html` template + `sendDonationConfirmation()` in messaging service + `notifyDonationConfirmed()` in notifications
5. **Account scoping**: Env var `ADMIN_ACCOUNT` for regular admins; super_admin sees all
6. **Admin middleware fix**: Add `'super_admin'` to allowed roles in `adminMiddleware`
7. **Admin role scoping fix**: Add `requireRole('admin', 'super_admin')` to donation-specific routes
