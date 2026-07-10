# Quickstart: Payment & Ticket Entrance Implementation

## Prerequisites

- Node.js 18+, npm
- PostgreSQL running (via Supabase or local)
- Mercado Pago test credentials (`MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`)
- `QR_JWT_SECRET` set (min 32 chars)
- Backend dependencies installed (`npm install` in `backend/`)

## Implementation Order

### Phase 1: Fix existing payment module

1. Fix `eventId` bug in `payments.repository.ts` — remove `eventId` from create params and Prisma data
2. Verify `PaymentProvider` interface is provider-agnostic (it is — no changes needed)
3. Verify registry works (it does — no changes needed)

### Phase 2: Add payment service + controller + routes

1. Create `payments.validators.ts` — Zod schemas for checkout, webhook, check-in
2. Create `payments.service.ts`:
   - `createCheckout(userId, ticketTypeId, quantity, backUrl)` → creates Payment (pending), calls provider.createCheckout(), returns checkout URL
   - `processWebhook(payload, headers)` → verify signature, parse, update Payment, create Ticket with QR if approved
   - `getPaymentStatus(paymentId, userId)` → return payment + tickets with QR tokens
   - `checkIn(qrToken, checkerId)` → verify JWT, atomic FOR UPDATE, mark used
3. Create `payments.controller.ts` — Express handlers wrapping service
4. Create `payments.routes.ts` — wire routes to controller
5. Create `payments/index.ts` — export `initPaymentsModule(app)` that registers routes

### Phase 3: QR generation

1. On payment webhook success (in service), generate JWT:
   ```ts
   jwt.sign({ tid: ticket.id, iat: Date.now() }, env.QR_JWT_SECRET, { algorithm: 'HS256' })
   ```
2. Store `qrToken` on Ticket record
3. No user info in payload

### Phase 4: Add check-in endpoint

1. POST /api/internal/checkin — verify JWT → validate status → atomic FOR UPDATE → mark used
2. Same transaction pattern as existing reservation system

### Phase 5: Add ticket service method

1. Add `createTicketForPurchase(payment, ticketsToCreate)` to `tickets.service.ts`
2. Creates Ticket records with status `active`, generates `ticketCode`, generates QR JWT

### Phase 6: Register routes in app.ts

1. In `backend/src/app.ts`, call `initPaymentsModule(app)`
2. Ensure webhook route is public, checkout route requires auth, check-in route requires checker role

### Phase 7: Tests

1. `tests/payments.service.test.ts`:
   - Checkout creation (mock Mercado Pago)
   - Webhook processing with valid/invalid signatures
   - Idempotent webhook handling
   - Ticket creation with QR on payment success
2. `tests/check-in.test.ts`:
   - Valid QR → success
   - Invalid JWT → 400
   - Expired/altered JWT → 400
   - Already checked in → 409
   - Concurrent check-in (two simultaneous requests) → only one succeeds

### Phase 8: README

1. Create `backend/src/modules/payments/README.md` — see tickets module for reference format

## Verification

```bash
cd backend
npm run dev
# Test checkout
curl -X POST http://localhost:3001/api/checkout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ticketTypeId":"...","quantity":1,"backUrl":"http://localhost:3000/return"}'

# Simulate webhook (Mercado Pago test)
# See Mercado Pago docs for test payload format

# Test check-in
curl -X POST http://localhost:3001/api/internal/checkin \
  -H "Authorization: Bearer $CHECKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"qrToken":"eyJ..."}'
```

## Key Files to Create/Modify

| Action | File |
|--------|------|
| FIX | `backend/src/modules/payments/payments.repository.ts` |
| CREATE | `backend/src/modules/payments/payments.validators.ts` |
| CREATE | `backend/src/modules/payments/payments.service.ts` |
| CREATE | `backend/src/modules/payments/payments.controller.ts` |
| CREATE | `backend/src/modules/payments/payments.routes.ts` |
| CREATE | `backend/src/modules/payments/index.ts` |
| MODIFY | `backend/src/modules/tickets/tickets.service.ts` |
| MODIFY | `backend/src/app.ts` |
| CREATE | `backend/src/modules/payments/README.md` |
| CREATE | `backend/tests/payments.service.test.ts` |
| CREATE | `backend/tests/check-in.test.ts` |
| UPDATE | `.specify/memory/constitution.md` (amend payments: Wompi → Mercado Pago) |
