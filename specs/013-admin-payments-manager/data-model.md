# Data Model: Admin Payments Manager

## Entity: Payment (existing)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID (PK) | Existing |
| userId | UUID (FK → users) | Existing |
| provider | String | 'mercadopago' |
| providerTxId | String? | Mercado Pago payment ID |
| amountCents | Int | Total in cents |
| status | PaymentStatus | Enhanced to include `partially_refunded` |
| metadata | Json? | Raw gateway response |
| createdAt | Timestamptz | Existing |
| updatedAt | Timestamptz | Existing |

**Status enum**: `pending`, `completed`, `failed`, `refunded`, `partially_refunded` (new)

**Relations**: User (N:1), Ticket[] (1:N), Refund[] (1:N)

---

## Entity: Refund (new)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID (PK) | Auto-generated |
| paymentId | UUID (FK → payments) | Which payment this refund belongs to |
| amountCents | Int | Refunded amount in cents |
| reason | String | Required, admin-provided reason |
| processedById | UUID (FK → users) | Admin who processed the refund |
| gatewayRefundId | String? | Mercado Pago refund ID (nullable until processed) |
| status | RefundStatus | `pending`, `processed`, `failed` |
| createdAt | Timestamptz | Existing |

**Status enum**: `pending`, `processed`, `failed`

**Relations**: Payment (N:1), ProcessedBy (N:1 → User)

**Validation**:
- `amountCents` > 0
- `amountCents` ≤ payment's remaining balance (payment.amountCents - sum of prior refunds)
- `reason` min 10 chars
- `processedById` must reference an admin/super_admin user

---

## Entity: User (existing, already includes refunds relation)

No changes — already has `payments` relation. Add `processedRefunds` relation for the refund processor.

---

## Extended API Contracts

### `GET /api/admin/payments`

**Query params (all optional)**:
- `page` (number, default 1)
- `limit` (number, default 25, max 100)
- `status` (PaymentStatus string)
- `dateFrom` (ISO date string)
- `dateTo` (ISO date string)
- `search` (string — matches user.email or ticketType.name)

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "amountCents": 5000,
      "status": "completed",
      "provider": "mercadopago",
      "providerTxId": "12345",
      "createdAt": "2026-01-01T00:00:00Z",
      "user": { "id": "uuid", "email": "a@b.com", "fullName": "Ana" },
      "ticketCount": 2
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 25
}
```

### `GET /api/admin/payments/:id`

**Response**: Full payment detail with user, tickets (with ticketType name + price), and refunds.

### `POST /api/admin/payments/:id/refund`

**Body**:
```json
{
  "amount": 5000,
  "reason": "Cancelación solicitada por el usuario"
}
```

**Response (201)**:
```json
{
  "id": "refund-uuid",
  "paymentId": "payment-uuid",
  "amountCents": 5000,
  "reason": "Cancelación solicitada por el usuario",
  "status": "processed",
  "gatewayRefundId": "mp-refund-id",
  "createdAt": "2026-01-01T00:00:00Z"
}
```

**Error (409)**: Refund exceeds remaining balance
```json
{ "error": { "code": "REFUND_EXCEEDS_BALANCE", "message": "...", "remaining": 3000 } }
```

### `GET /api/admin/payments/export`

**Query params**: Same filters as list endpoint.

**Response**: CSV file download with `Content-Type: text/csv`.
