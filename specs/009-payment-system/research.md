# Research: Payment System

## Mercado Pago Checkout Pro (Node.js)

- **SDK**: `mercadopago` (npm) — official Node.js SDK v2.
- **Integration**: Checkout Pro (redirect/hosted page). Create preference via `Preference.create()`.
- **Amount**: Accepts integer pesos (COP). Convert: `Math.round(amountCents / 100)`.
- **Reference**: Set `external_reference = payment.id` for webhook lookup.
- **back_urls**: `success`, `failure`, `pending` → `FRONTEND_URL/mi-cuenta/tiquetes?payment={payment_id}`.
- **Auth**: `MERCADOPAGO_ACCESS_TOKEN` (server-side, never exposed client-side).

## Webhook Signature Verification

- **Header**: `x-signature` in incoming webhook requests.
- **Secret**: `MERCADOPAGO_WEBHOOK_SECRET` env var.
- **Process**: HMAC-SHA256 of payload + timestamp. SDK does not provide a built-in verifier — must implement manually or use `crypto` module.
- **Payload**: MP sends `data.id` (payment ID on MP side) + `type` (e.g., "payment", "payment.updated").

## Webhook Event Types

- `payment` (created) → ignore in v1.
- `payment.updated` → check `action` field: `payment.approved`, `payment.declined`, `payment.refunded`.
- v1 scope: only `payment.approved` and `payment.declined`.

## Existing Payment Model vs Spec

| Aspect | Current (schema.prisma) | Spec Required | Migration |
|--------|----------------------|---------------|-----------|
| `ticketId` | Unique, required | Removed | Drop column + constraint |
| `userId` | Present | Keep | — |
| `amount` | Decimal(12,2) | `amountCents` Int | Rename + retype |
| `currency` | String "COP" | Removed | Drop column |
| `paymentMethod` | String | Renamed to `provider` + `providerTxId` | Drop + add |
| `gatewayReference` | String? | Removed | Drop column |
| `eventId` | Missing | Required | Add FK |
| `metadata` | Missing | Json? | Add column |
| `paidAt` | DateTime? | Removed (use metadata + status) | Drop column |
| `updatedAt` | Missing | @updatedAt | Add column |
| `tickets` relation | hasOne via ticketId | hasMany via paymentId on Ticket | Add FK on Ticket |

**Decision**: Create new `payments` table model (new migration) rather than altering existing. Existing Payment model was never used in production (no real payment data). Drop old table in migration.

## Ticket Expiry Cron (Existing)

- `reserveExpiresAt` field on Ticket model already exists.
- Cron job (background) queries tickets where `status = 'reserved' AND reserveExpiresAt < NOW()`.
- Sets status to `expired` and decrements `ticketType.quantitySold`.
- No changes needed — cron handles the TTL automatically.

## Provider Registry Pattern

- No existing registry pattern in codebase (direct imports everywhere).
- New pattern: `Map<string, PaymentProvider>` + `getProvider(name)` factory.
- Reasonable new addition: service never imports SDK, only the type.
- See FR-2 and FR-6.

## Decisions Summary

- **Decision**: `mercadopago` npm SDK v2 for MP integration.
  - Rationale: Official package, widely used, maintained.
  - Alternatives: Raw HTTP calls to MP API (more work, no benefit).

- **Decision**: Custom signature verification using `crypto` module.
  - Rationale: SDK v2 lacks built-in webhook verifier.
  - Alternatives: None — manual implementation required.

- **Decision**: New Payment model, drop old table.
  - Rationale: Structural changes too deep for in-place migration; no production data.
  - Alternatives: Incremental migration (column adds/drops) — riskier, same end state.

- **Decision**: No refund handling in v1.
  - Rationale: Out of scope per spec. `refunded` status remains in enum for future use.
