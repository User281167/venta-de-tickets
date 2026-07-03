# Contract: POST /api/payments/checkout

**Purpose**: Initiate a payment checkout — atomically reserve tickets, create payment record, return provider checkout URL.

**Auth Required**: Yes (Bearer token via auth middleware)

**Rate Limiting**: Yes (global rate limit, no per-endpoint limit in v1)

## Request

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Body (JSON)

```json
{
  "ticket_type_id": "uuid",
  "quantity": 2
}
```

### Validation (Zod)

| Field | Rule |
|-------|------|
| ticket_type_id | string, uuid format |
| quantity | number, integer, ≥ 1 |

## Responses

### 201 Created — Checkout URL Generated

```json
{
  "payment_id": "019abc...",
  "checkout_url": "https://www.mercadopago.com.co/checkout/v1/redirect?preference_id=...",
  "reserve_expires_at": "2026-07-01T20:38:00Z"
}
```

### 422 Unprocessable — Validation Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Quantity must be at least 1"
  }
}
```

### 409 Conflict — Insufficient Inventory

```json
{
  "error": {
    "code": "INSUFFICIENT_INVENTORY",
    "message": "Only 1 tickets remaining"
  }
}
```

### 409 Conflict — Concurrent Checkout Race

```json
{
  "error": {
    "code": "INVENTORY_EXHAUSTED",
    "message": "Tickets sold out during checkout"
  }
}
```

### 500 Internal Server Error — Provider Unavailable

```json
{
  "error": {
    "code": "PAYMENT_PROVIDER_ERROR",
    "message": "Payment provider is unavailable. Your tickets are reserved — please try again"
  }
}
```
