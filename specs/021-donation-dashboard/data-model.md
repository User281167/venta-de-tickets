# Data Model — Admin Donation Dashboard

## No Schema Changes Required

All donation data is already defined in Prisma schema. This feature only adds new query methods to the repository layer and new behavior (cron, email) on top of existing entities.

### Existing Entity: Donation

**Table**: `donations`

| Field | Type | Notes |
|-------|------|-------|
| id | UUID (PK) | Auto-generated |
| full_name | VARCHAR(150) nullable | Donor name; null = "Anónimo" |
| email | VARCHAR(255) nullable | Donor email; null = no email possible |
| amount_cents | DECIMAL(12,2) | Minimum 2000 |
| state | DonationStatus enum | `pending` → `confirmed`/`rejected`/`cancelled` |
| account | DonationAccount enum | `LA_CONVENCION` or `BARRANQUEROS_UTP` |
| external_reference | VARCHAR(100) unique | Format: `DON-{account}-{uuid}` |
| payment_id | VARCHAR(255) nullable | Provider transaction ID |
| metadata | JSON nullable | Raw webhook payload |
| created_at | TIMESTAMPTZ | Default now() |
| updated_at | TIMESTAMPTZ | Auto-updated |

**Indexes**: `(state, account)`

### State Transitions

```
pending ──┬──→ confirmed  (webhook: approved)
           ├──→ rejected   (webhook: declined)
           └──→ cancelled  (cron: 20min expiry)
confirmed ──→ cancelled    (manual admin action — future scope)
```

### New Repository Methods Required

| Method | Input | Output | Description |
|--------|-------|--------|-------------|
| `findAllAdmin(filters)` | `{ page, limit, state?, account?, search? }` | `{ data: Donation[], total: number }` | Paginated list with filters |
| `expirePending(olderThan: Date)` | cutoff date | `{ count: number }` | Mark pending → cancelled where createdAt < cutoff |

### New Environment Variable

| Variable | Type | Required for | Description |
|----------|------|--------------|-------------|
| `ADMIN_ACCOUNT` | `LA_CONVENCION` or `BARRANQUEROS_UTP` | Non-super-admin admins | Scopes donation list to one account |

### New Email Template

**File**: `backend/src/modules/messaging/templates/donation-confirmed.html`

**Variables**: `{{donorName}}`, `{{amount}}`, `{{accountName}}`, `{{donationDate}}`
