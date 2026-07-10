# Data Model: Payment & Ticket Entrance

## Payment

| Field | Type | Notes |
|-------|------|-------|
| id | UUID (PK) | Auto-generated |
| userId | UUID (FK → users) | Buyer |
| provider | VARCHAR(50) | `mercadopago`, `paypal`, `stripe` |
| providerTxId | VARCHAR(255)? | Provider's transaction ID, idempotency key |
| amountCents | Int | Total in cents |
| status | PaymentStatus enum | `pending` → `completed` / `failed` / `refunded` |
| metadata | JSON? | Provider-specific raw data |
| createdAt | TIMESTAMPTZ | Auto |
| updatedAt | TIMESTAMPTZ | Auto |

**State machine**: `pending` → `completed` | `failed` | `refunded`

**Rules**:
- `providerTxId` must be unique at provider level (enforced by application, not DB)
- `amountCents` must be positive
- Metadata stores full provider response for debugging

## Ticket

| Field | Type | Notes |
|-------|------|-------|
| id | UUID (PK) | Auto-generated |
| ticketTypeId | UUID (FK → ticket_types) | Which ticket type |
| userId | UUID (FK → users) | Owner |
| paymentId | UUID (FK → payments)? | Purchase transaction |
| discountCodeId | UUID (FK → discount_codes)? | Applied discount |
| discountApplied | DECIMAL? | Discount amount |
| ticketCode | VARCHAR(100) UNIQUE | Human-readable code (e.g. UUID short) |
| qrToken | TEXT UNIQUE? | JWT signed with QR_JWT_SECRET |
| status | TicketStatus enum | See below |
| reserveExpiresAt | TIMESTAMPTZ? | Not used for paid tickets (remains null) |
| purchasedAt | TIMESTAMPTZ? | Set when payment confirmed |
| cancelledAt | TIMESTAMPTZ? | Set when cancelled |
| checkedInAt | TIMESTAMPTZ? | Set at check-in |
| checkedInBy | UUID (FK → users)? | Checker identity |
| createdAt | TIMESTAMPTZ | Auto |

**State machine**: `reserved` → `active` (on payment) → `used` (on check-in) | `cancelled` | `expired`

**Rules**:
- QR token generated only when ticket reaches `active` status
- `qrToken` is JWT: `HS256({ tid: ticket.id, iat: Date.now() })`, signed with `QR_JWT_SECRET`
- No user-identifiable data in QR payload
- `reserveExpiresAt` is always null for tickets created via successful purchase
- A ticket cannot transition from `used` to any other state
- `ticketCode` generated as short UUID or random string at creation

## QR Token Specification

- **Algorithm**: HS256 (HMAC-SHA256)
- **Secret**: `QR_JWT_SECRET` from env (min 32 chars)
- **Payload**:
  ```json
  {
    "tid": "uuid-del-ticket",
    "iat": 1234567890
  }
  ```
- **Encoding**: JWT compact serialization (`base64url(header).base64url(payload).signature`)
- **User data**: None in payload
- **Verification**: Verify signature first (fail fast, no DB query). Then query DB by `tid` for status validation.

## Check-in Transaction

Atomic operation inside a Prisma interactive transaction:

1. `SELECT ... FOR UPDATE` on ticket row (row-level lock)
2. Verify ticket exists
3. Verify `status === 'active'`
4. Update: `status = 'used'`, `checkedInAt = now()`, `checkedInBy = checkerId`
5. Commit

If any step fails, transaction rolls back and error is returned.

## Relationship Diagram

```
Payment 1───* Ticket
TicketType 1───* Ticket
User 1───* Ticket (owner)
User 1───* Ticket (checker, via checkedInBy)
```
