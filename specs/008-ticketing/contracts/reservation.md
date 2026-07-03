# Reservation API

## POST /api/tickets/reserve

Atomic reservation with FOR UPDATE locking. Creates tickets with unique codes and QR tokens.

**Auth**: Required (any authenticated user)

**Request**:
```json
{
  "ticketTypeId": "uuid",
  "quantity": 2
}
```

- `quantity`: 1–4 (or `maxPerUser` of ticket type, whichever is lower)

**Response `201`**:
```json
{
  "reservation": {
    "reserveExpiresAt": "2026-07-01T12:10:00Z",
    "tickets": [
      {
        "id": "uuid",
        "ticketCode": "FM26-0042",
        "ticketTypeId": "uuid",
        "status": "reserved",
        "qrToken": "eyJhbGciOiJIUzI1NiIs..."
      },
      {
        "id": "uuid",
        "ticketCode": "FM26-0043",
        "ticketTypeId": "uuid",
        "status": "reserved",
        "qrToken": "eyJhbGciOiJIUzI1NiIs..."
      }
    ]
  }
}
```

**Errors**:

| Status | Condition |
|--------|-----------|
| `400` | Validation error (invalid quantity, missing fields) |
| `401` | Unauthenticated |
| `409` | Insufficient availability |
| `409` | User already has active reservation for this event |
| `400` | Ticket type is deactivated |

## GET /api/tickets/my-reservations

Get user's active reservations for the current event.

**Auth**: Required

**Response `200`**:
```json
{
  "tickets": [
    {
      "id": "uuid",
      "ticketCode": "FM26-0042",
      "status": "reserved",
      "reserveExpiresAt": "2026-07-01T12:10:00Z",
      "ticketType": {
        "id": "uuid",
        "name": "General"
      }
    }
  ]
}
```
