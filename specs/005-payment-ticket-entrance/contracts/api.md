# API Contracts: Payment & Ticket Entrance

## Base URL

All endpoints under `/api`.

## Authentication

| Endpoint | Auth |
|----------|------|
| POST /api/checkout | JWT + any authenticated user |
| POST /api/payments/webhook | None (provider calls) |
| GET /api/payments/:id/status | JWT + owner or admin |
| POST /api/internal/checkin | JWT + `checker` or `admin` role |

## POST /api/checkout

Create a payment checkout session.

**Request**:
```json
{
  "items": [
    { "ticketTypeId": "uuid", "quantity": 1 }
  ],
  "backUrl": "https://frontend.com/return",
  "provider": "mercadopago"
}
```

**Validation**:
- `items`: array, min 1 element
- `items[].ticketTypeId`: valid UUID, must reference existing enabled TicketType
- `items[].quantity`: integer >= 1, must not exceed `maxPerUser` on TicketType
- `backUrl`: valid URL (frontend return URL)
- `provider`: string, must match a registered provider name

**Response 201**:
```json
{
  "paymentId": "uuid",
  "checkoutUrl": "https://mercadopago.com/checkout/..."
}
```

**Errors**: 422 (validation), 404 (ticket type not found), 400 (sold out)

---

## POST /api/payments/webhook/:provider

Payment provider webhook receiver. Provider identified by URL segment (`:provider`).

**Request**: Raw provider webhook payload (varies by provider)

**Headers**: Provider-specific signature headers (e.g. `x-signature`, `x-request-id` for Mercado Pago)

**Response 200**:
```json
{
  "received": true
}
```

**Processing**:
1. Detect provider from URL query or webhook shape (future: route per provider)
2. Verify webhook signature via `provider.verifySignature()`
3. Parse via `provider.parseWebhook()` → `NormalizedWebhookEvent`
4. Check idempotency (`providerTxId` already processed?)
5. If payment approved: update Payment → `completed`, create Ticket → `active` with QR JWT
6. If payment declined: update Payment → `failed`

**Errors**: 400 (invalid signature), 404 (payment reference not found)

---

## GET /api/payments/:id/status

Check payment status.

**Response 200**:
```json
{
  "id": "uuid",
  "status": "completed",
  "amountCents": 5000,
  "provider": "mercadopago",
  "tickets": [
    {
      "id": "uuid",
      "ticketCode": "abc123",
      "status": "active",
      "qrToken": "eyJ..."
    }
  ]
}
```

**Errors**: 404 (payment not found), 403 (not owner/admin)

---

## POST /api/internal/checkin

QR code check-in. Internal endpoint (called by scanner device).

**Request**:
```json
{
  "qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation**:
- `qrToken`: must be valid JWT signed with `QR_JWT_SECRET`
- If signature invalid → reject immediately (no DB query)

**Processing**:
1. Decode JWT header, verify signature with `QR_JWT_SECRET`
2. If invalid signature → 400 "Invalid QR code"
3. Extract `tid` from payload
4. Begin DB transaction:
   - `SELECT ... FOR UPDATE` on ticket row
   - Verify ticket exists → 404 if not
   - Verify `status === 'active'` → 409 if not
   - Update `status = 'used'`, `checkedInAt = now()`, `checkedInBy = req.user.id`
   - Commit
5. Return success

**Response 200**:
```json
{
  "success": true,
  "ticket": {
    "id": "uuid",
    "ticketCode": "abc123",
    "checkedInAt": "2026-07-09T20:00:00Z"
  }
}
```

**Response 400** (invalid QR):
```json
{
  "error": "INVALID_QR",
  "message": "Invalid or tampered QR code"
}
```

**Response 409** (already checked in / invalid status):
```json
{
  "error": "TICKET_NOT_AVAILABLE",
  "message": "Ticket is already checked in or not in valid status",
  "currentStatus": "used"
}
```

**Errors**: 400 (invalid JWT), 401 (unauthorized), 404 (ticket not found), 409 (conflict — already used)

---

## Error Response Format (all endpoints)

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description"
}
```

| HTTP Code | Error Code | When |
|-----------|------------|------|
| 400 | INVALID_QR | QR JWT signature invalid |
| 401 | UNAUTHORIZED | Missing/invalid auth token |
| 403 | FORBIDDEN | Insufficient role |
| 404 | NOT_FOUND | Resource not found |
| 409 | TICKET_NOT_AVAILABLE | Already checked in / wrong status |
| 422 | VALIDATION_ERROR | Request body validation failed |
