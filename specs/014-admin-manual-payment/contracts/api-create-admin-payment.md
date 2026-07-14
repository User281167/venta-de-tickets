# API Contracts: Admin Manual Payment

## POST /api/admin/payments/manual

Create a manual or gift payment + tickets for a user (admin-only). All in single DB transaction.

### Request

```
POST /api/admin/payments/manual
Content-Type: application/json
Authorization: Bearer <admin-session-token>
```

```json
{
  "userId": "uuid-string",
  "provider": "MANUAL",
  "tickets": [
    { "ticketTypeId": "uuid-1", "quantity": 2 },
    { "ticketTypeId": "uuid-2", "quantity": 1 }
  ]
}
```

### Validation Rules (Zod)

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| userId | string | yes | Valid UUID |
| provider | enum | yes | Must be "MANUAL" or "GIFT" |
| tickets | array | yes | Min 1 item |
| tickets[].ticketTypeId | string | yes | Valid UUID |
| tickets[].quantity | number | yes | Integer, >= 1 |

### Backend Logic

1. Validate input with Zod
2. Look up user — 404 if not found
3. Fetch each ticket type — 404 if any not found
4. For each ticket type: validate `sold + requested <= total` — 409 if any fails with details
5. Skip maxPerUser check (admin bypass)
6. Calculate total amountCents = sum(price * quantity) for all ticket types
7. Create Payment with status=completed, provider=MANUAL/GIFT, createdBy=adminId
8. Create tickets linked to payment, status=paid
9. Update quantity_sold for each ticket type
10. All inside prisma.$transaction — rollback on any failure
11. Generate QR for each ticket after transaction

### Success Response (201)

```json
{
  "paymentId": "payment-uuid",
  "provider": "MANUAL",
  "amountCents": 75000,
  "status": "completed",
  "createdBy": "admin-uuid",
  "ticketIds": ["ticket-uuid-1", "ticket-uuid-2", "ticket-uuid-3"]
}
```

### Error Responses

**422 Validation Error**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "provider must be MANUAL or GIFT"
  }
}
```

**409 Stock Conflict**:
```json
{
  "error": {
    "code": "SOLD_OUT",
    "message": "Not enough tickets available for \"VIP\", available: 1, requested: 3",
    "details": [
      { "ticketTypeId": "uuid", "name": "VIP", "available": 1, "requested": 3 }
    ]
  }
}
```

**404 Not Found**:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found"
  }
}
```

**401 Unauthorized**: Standard auth middleware response.
**403 Forbidden**: Non-admin users trying to access endpoint.
