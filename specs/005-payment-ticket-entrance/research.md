# Research: Payment Multi-Provider & Ticket QR Entrance

## Decisions

### 1. Payment Provider — Mercado Pago over Wompi

- **Decision**: Use Mercado Pago (already implemented in codebase)
- **Rationale**: Existing code already uses `mercadopago` npm package, has `MercadoPagoProvider` class with preference creation, webhook signature verification, and webhook parsing. Constitution lists Wompi but this is an error from initial drafting — Mercado Pago was always the implementation target.
- **Alternatives considered**: Wompi (constitution text only, no implementation), PayPal/Stripe (future providers via same interface)

### 2. Provider Interface — Current design sufficient

- **Decision**: Keep existing `PaymentProvider` interface as-is
- **Rationale**: Current interface (`getProviderName`, `createCheckout`, `verifySignature`, `parseWebhook`) is provider-agnostic. Types `CheckoutInput`, `CheckoutResult`, `NormalizedWebhookEvent` have no Mercado Pago specifics. Interface fits PayPal/Stripe equally.
- **Minor fix needed**: `CheckoutInput` has `expiresAt: string` — generic enough, maps to each provider's expiry concept. No changes required.

### 3. QR Token Format — JWT with QR_JWT_SECRET

- **Decision**: QR token = compact JWT (`HS256`) signed with `QR_JWT_SECRET`, payload `{ tid: string, iat: number }`, encoded as base64url
- **Rationale**: Meets user requirements (no user info in payload). JWT provides tamper-proofing. Signature verification rejects forged QR without DB query.
- **Alternatives considered**: Random opaque token (requires DB lookup for every scan), signed data with HMAC (similar security, non-standard)

### 4. Ticket Status Mapping — Existing Prisma enum

- **Decision**: Use existing `TicketStatus` enum values
  - `reserved` → payment pending / cart checkout initiated
  - `active` → payment confirmed, ticket valid for entry
  - `used` → ticket checked in at entrance
  - `cancelled` → ticket voided
  - `expired` → event passed without check-in
  - `confirmed` → (future use, e.g. manual confirmation)
- **Rationale**: User said "no run auto migration". Existing enum covers all needed states. No `paid` or `checked_in` values needed — `active` and `used` serve these roles.

### 5. Atomic Check-in — FOR UPDATE row lock

- **Decision**: Use Prisma `$transaction` with `SELECT ... FOR UPDATE` via raw query or Prisma `update` inside interactive transaction
- **Rationale**: Prevents double check-in from concurrent scanners. Same pattern used in existing reservation system.
- **Implementation**: Read ticket with `FOR UPDATE` inside transaction, verify status is `active`, update to `used` with `checkedInAt` and `checkedInBy`.

### 6. Webhook Idempotency — providerTxId as idempotency key

- **Decision**: Use `providerTxId` (unique per provider transaction) as idempotency key
- **Rationale**: Payment schema already has `providerTxId` field. Check `providerTxId` exists before processing webhook. If duplicate, skip processing.
- **Alternatives considered**: Separate idempotency table (over-engineering at current scale)

### 7. eventId Bug in payments.repository.ts

- **Current state**: `create()` takes `eventId` parameter and writes `eventId: input.eventId` to Prisma
- **Problem**: Prisma `Payment` model has no `eventId` field — will crash at runtime
- **Fix**: Remove `eventId` from create parameters and Prisma data object
- **Origin**: Likely leftover from earlier schema version. Safe to remove.

### 8. Purchase Flow — Checkout → Webhook → Ticket

- **Flow**: User selects ticket type → POST /api/checkout → create Payment (pending) + Mercado Pago preference → return checkout URL → user pays on MP → MP sends webhook → verify signature → validate payment status → update Payment (completed) → create Ticket (active) + generate QR JWT → return
- **Note**: `frontend` work for rendering Mercado Pago Wallet Brick is out of scope for this plan (backend + API only)
