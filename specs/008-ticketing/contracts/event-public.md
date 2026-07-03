# Public Event Page API

## GET /api/events/:eventId

Public endpoint, no auth required.

**Response `200`**:
```json
{
  "id": "uuid",
  "title": "Fiesta de Medio Año 2026",
  "description": "La mejor fiesta del año",
  "eventDate": "2026-07-15T20:00:00Z",
  "location": "Centro de Eventos, Medellín",
  "status": "published",
  "ticketTypes": [
    {
      "id": "uuid",
      "name": "General",
      "description": "Entrada general",
      "price": 120000.00,
      "availableCount": 158,
      "maxPerUser": 4,
      "isSoldOut": false
    },
    {
      "id": "uuid",
      "name": "VIP",
      "description": "Entrada VIP",
      "price": 250000.00,
      "availableCount": 0,
      "maxPerUser": 2,
      "isSoldOut": true
    }
  ]
}
```

**Errors**: `404` event not found.

**Notes**:
- Only `isActive = true` ticket types returned
- `availableCount = quantityTotal - quantitySold`
- Sold-out types still returned with `isSoldOut: true` — frontend shows "Agotado"
- Price as Decimal — frontend formats display using `formatCOP()`
