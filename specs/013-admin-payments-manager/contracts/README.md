# API Contracts: Admin Payments

## Base URL

```
/api/admin/payments
```

All endpoints require `authMiddleware` + `adminMiddleware` + `requireRole('admin')`.

---

## `GET /api/admin/payments` — List payments

**Query params** (all optional):
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 25 | Items per page (max 100) |
| `status` | string | — | Filter: `pending`, `completed`, `failed`, `refunded`, `partially_refunded` |
| `dateFrom` | string | — | ISO date, inclusive lower bound on `createdAt` |
| `dateTo` | string | — | ISO date, inclusive upper bound on `createdAt` |
| `search` | string | — | Free text matching `user.email` or `ticketType.name` (ILIKE) |

**Response 200**:
```jsonc
{
  "data": [
    {
      "id": "uuid",
      "amountCents": 5000,
      "status": "completed",
      "provider": "mercadopago",
      "providerTxId": "12345",
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-01T00:00:00Z",
      "user": {
        "id": "uuid",
        "email": "ana@test.com",
        "fullName": "Ana Pérez"
      },
      // ticketCount is a computed field from the query,
      // not a stored column
      "ticketCount": 2
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 25
}
```

---

## `GET /api/admin/payments/:id` — Payment detail

**Response 200**:
```jsonc
{
  "id": "uuid",
  "amountCents": 5000,
  "status": "completed",
  "provider": "mercadopago",
  "providerTxId": "12345",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z",
  "user": {
    "id": "uuid",
    "email": "ana@test.com",
    "fullName": "Ana Pérez",
    "cedula": "1234567890"
  },
  "tickets": [
    {
      "id": "uuid",
      "ticketCode": "abc123",
      "status": "paid",
      "ticketType": {
        "id": "uuid",
        "name": "Entrada General",
        "price": 50.00
      }
    }
  ],
  "refunds": [
    {
      "id": "uuid",
      "amountCents": 2500,
      "reason": "Cancelación solicitada por el usuario",
      "status": "processed",
      "processedBy": {
        "id": "uuid",
        "fullName": "Admin Name"
      },
      "createdAt": "2026-01-02T00:00:00Z"
    }
  ]
}
```

**Response 404**:
```json
{ "error": { "code": "NOT_FOUND", "message": "Payment not found" } }
```

---

## `POST /api/admin/payments/:id/refund` — Process refund

**Body**:
```json
{
  "amount": 5000,
  "reason": "Cancelación solicitada por el usuario"
}
```

**Validation**:
- `amount`: number, integer, > 0, ≤ remaining balance
- `reason`: string, min 10 chars, max 500 chars

**Response 201**:
```json
{
  "id": "refund-uuid",
  "paymentId": "payment-uuid",
  "amountCents": 5000,
  "reason": "Cancelación solicitada por el usuario",
  "status": "processed",
  "createdAt": "2026-01-02T00:00:00Z"
}
```

**Response 409** (exceeds remaining balance):
```json
{
  "error": {
    "code": "REFUND_EXCEEDS_BALANCE",
    "message": "El reembolso excede el saldo disponible",
    "remaining": 3000
  }
}
```

**Response 400** (validation error):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Reason must be at least 10 characters"
  }
}
```

---

## `GET /api/admin/payments/export` — Export CSV

**Query params**: Same filters as list endpoint + `format` (default `csv`).

**Response 200**: `Content-Type: text/csv`, `Content-Disposition: attachment; filename="pagos-2026-07-12.csv"`

Columns: ID, Usuario, Email, Evento/Ticket, Tickets, Total, Estado, Fecha, Proveedor, ID Transacción
