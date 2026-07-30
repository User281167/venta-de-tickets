# API Contracts — Admin Donation Dashboard

## GET /api/admin/donations

List donations with pagination, filters, and search. Admin-scoped by account.

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| page | integer | No (default 1) | Page number |
| limit | integer | No (default 50) | Items per page (max 100) |
| state | string | No | Filter by state: `pending`, `confirmed`, `rejected`, `cancelled` |
| account | string | No | Filter by account: `LA_CONVENCION`, `BARRANQUEROS_UTP` |
| search | string | No | Partial match on full_name or email |

### Response (200)

```json
{
  "data": [
    {
      "id": "uuid",
      "fullName": "Juan Pérez or null",
      "email": "juan@example.com or null",
      "amountCents": 500000,
      "state": "confirmed",
      "account": "LA_CONVENCION",
      "externalReference": "DON-LA_CONVENCION-xxxx",
      "paymentId": "mp-payment-id or null",
      "createdAt": "2026-07-30T12:00:00.000Z",
      "updatedAt": "2026-07-30T12:05:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 50
}
```

### Response (403)

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Admin access required"
  }
}
```

## POST /api/admin/donations/:id/resend-email

Resend donation confirmation email. Only allowed for `confirmed` state with non-null email.

### Parameters

| Param | Type | In | Description |
|-------|------|----|-------------|
| id | uuid | path | Donation ID |

### Response (200)

```json
{
  "success": true,
  "message": "Email reenviado exitosamente"
}
```

### Response (422 — invalid state)

```json
{
  "error": {
    "code": "INVALID_STATE",
    "message": "Solo se puede reenviar email para donaciones confirmadas"
  }
}
```

### Response (422 — no email)

```json
{
  "error": {
    "code": "NO_EMAIL",
    "message": "La donación no tiene email asociado"
  }
}
```

### Response (404)

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Donación no encontrada"
  }
}
```
