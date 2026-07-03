# Admin Ticket Types API

## GET /api/admin/ticket-types

List all ticket types for the event.

**Auth**: super_admin, organizer

**Response `200`**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "General",
      "description": "Entrada general",
      "price": 120000.00,
      "quantityTotal": 500,
      "quantitySold": 342,
      "maxPerUser": 4,
      "isActive": true,
      "saleEndsAt": "2026-08-01T00:00:00Z",
      "createdAt": "2026-06-01T00:00:00Z",
      "updatedAt": "2026-06-15T00:00:00Z"
    }
  ]
}
```

## POST /api/admin/ticket-types

**Auth**: super_admin, organizer

**Request**:
```json
{
  "name": "VIP",
  "description": "Entrada VIP con acceso a zona exclusiva",
  "price": 250000.00,
  "quantityTotal": 100,
  "maxPerUser": 2,
  "saleEndsAt": "2026-07-30T00:00:00Z"
}
```

**Response `201`**:
```json
{
  "id": "uuid",
  "name": "VIP",
  "price": 250000.00,
  "quantityTotal": 100,
  "quantitySold": 0,
  "isActive": true
}
```

**Errors**: `400` validation error, `401` unauthorised, `403` forbidden.

## PATCH /api/admin/ticket-types/:id

**Auth**: super_admin, organizer

**Request** (partial):
```json
{
  "name": "VIP Plus",
  "price": 300000.00,
  "isActive": true
}
```

**Response `200`**: Updated ticket type object.

**Errors**: `404` not found, `400` validation error.

## DELETE /api/admin/ticket-types/:id

Soft-delete — sets `isActive = false`. Hard delete rejected if tickets exist.

**Auth**: super_admin, organizer

**Response `200`**:
```json
{
  "message": "Ticket type deactivated"
}
```

**Errors**: `409` if tickets reference this type, `404` not found.
