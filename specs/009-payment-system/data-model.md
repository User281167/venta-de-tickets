# Data Model: Payment System

## Payment

Represents a payment transaction attempt through an external provider.

| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| id | uuid | PK, auto-generated | Universal reference for provider `external_reference` |
| userId | uuid | FK → users.id, NOT NULL, indexed | Paying user |
| eventId | uuid | FK → events.id, NOT NULL, indexed | Event being paid for |
| provider | varchar(50) | NOT NULL | Provider name: `'mercadopago'`, `'wompi'`, etc. |
| providerTxId | varchar(255) | NULL | Provider-side transaction ID (after preference creation) |
| amountCents | integer | NOT NULL | Amount in minor currency units (COP cents) |
| status | PaymentStatus | NOT NULL, default: `pending` | `pending` | `completed` | `failed` |
| metadata | jsonb | NULL | Raw provider response for debugging/reconciliation |
| createdAt | timestamptz | NOT NULL, default: now() | |
| updatedAt | timestamptz | NOT NULL, auto-updated | |

**Relations**:
- Belongs to User (userId → users.id)
- Belongs to Event (eventId → events.id)
- Has many Tickets (tickets.paymentId → payments.id)

## PaymentStatus (Enum)

Values: `pending`, `completed`, `failed`, `refunded`

Transitions:
- `pending` → `completed` (webhook: approved)
- `pending` → `failed` (webhook: declined)
- `completed` → `refunded` (future, out of scope)

## Ticket (Modified)

**Add**:
| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| paymentId | uuid? | FK → payments.id, NULLABLE, indexed | Linked payment (NULL until checkout) |

**Remove**:
- Existing `payment` relation (Ticket → Payment via Payment.ticketId) is dropped in favor of the new Payment → Tickets one-to-many.

**Unchanged**:
- All other fields (ticketTypeId, eventId, userId, status, reserveExpiresAt, etc.)
- Status transitions: `available → reserved → confirmed | cancelled | expired`

## Validation Rules

| Entity | Field | Rule |
|--------|-------|------|
| Checkout Input | ticketTypeId | Must reference existing, active TicketType |
| Checkout Input | quantity | Must be > 0 and ≤ TicketType.maxPerUser (if set) |
| Checkout Input | quantity | Must leave enough available inventory |
| Payment | amountCents | Auto-calculated: ticketType.price × quantity, converted to cents |
| Payment | status | Only mutable from `pending` to `completed` or `failed` |
| Payment | providerTxId | Set after successful provider preference creation |

## State Diagrams

### Checkout (per-payment lifecycle)

```
[ticketType available]
       │
       ▼
[DB Transaction]
  ├─ reserve N tickets → 'reserved'
  ├─ create Payment → 'pending'
  └─ link tickets → paymentId set
       │
       ▼
[Provider Call: createCheckout()]
  ├─ Success → providerTxId set → return checkout_url
  └─ Failure → tickets expire via cron (10min TTL)
                payment stays 'pending' (user retries)
```

### Webhook (per-payment state)

```
payment 'pending'
       │
  webhook received
       │
  ┌────┴────┐
  │         │
approved  declined
  │         │
  ▼         ▼
completed  failed
  │         │
  ▼         ▼
tickets    tickets
confirmed  cancelled
```
