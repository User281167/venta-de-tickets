# API Contracts: Tickets

## Base URLs

| Scope | Prefix | Auth |
|-------|--------|------|
| Public | `GET /api/tickets` | None (auth optional) |
| Public | `GET /api/tickets/:id` | None (auth optional) |
| Admin | `POST /api/admin/tickets` | authMiddleware + adminMiddleware |
| Admin | `PATCH /api/admin/tickets/:id` | authMiddleware + adminMiddleware |
| Admin | `PATCH /api/admin/tickets/:id/status` | authMiddleware + adminMiddleware |

## Common Responses

```json
{
  "error": {
    "code": "VALIDATION_ERROR | NOT_FOUND | FORBIDDEN | UNAUTHORIZED | INTERNAL_ERROR",
    "message": "Human-readable description"
  }
}
```

## Endpoints

### GET /api/tickets — List ticket types (public)

**Auth**: None required. Returns same data regardless of auth/role.

**Query Parameters**:
| Param | Type | Default | Max | Description |
|-------|------|---------|-----|-------------|
| page | integer | 1 | — | Page number (min 1) |
| limit | integer | 20 | 100 | Items per page |

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "General",
      "description": "Standard entry",
      "price": 25000.00,
      "quantityTotal": 500,
      "quantitySold": 120,
      "maxPerUser": 4,
      "saleEndsAt": "2026-08-01T23:59:00Z",
      "status": "enabled",
      "createdAt": "2026-07-01T00:00:00Z",
      "updatedAt": "2026-07-01T00:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20
}
```

**Behavior**: Filters out `blocked` ticket types. Includes `enabled` and `disabled`.

**Edge Cases**:
- Page beyond total: returns empty `data[]`, `page` = requested, `total` unchanged
- Invalid query params (page=0, limit=200): 422 validation error
- No ticket types: returns empty `data[]`, `total: 0`

### GET /api/tickets/:id — Get ticket type by ID (public)

**Auth**: None required.

**Path Parameters**: `id` — UUID of ticket type

**Response 200**: Single ticket type object (same shape as list item)

**Response 404**:
```json
{ "error": { "code": "NOT_FOUND", "message": "Ticket type not found" } }
```

**Behavior**: Returns ticket type regardless of status (enabled, disabled, or blocked).

### POST /api/admin/tickets — Create ticket type (admin)

**Auth**: Required (authMiddleware + adminMiddleware).

**Request Body**:
```json
{
  "name": "VIP",
  "description": "VIP access with perks",
  "price": 75000.00,
  "quantityTotal": 100,
  "maxPerUser": 2,
  "saleEndsAt": "2026-08-01T23:59:00Z"
}
```

**Validation**:
| Field | Rule |
|-------|------|
| name | Required, non-empty string |
| description | Optional string |
| price | Required, must be > 0 |
| quantityTotal | Required, integer, must be > 0 |
| maxPerUser | Optional integer, must be > 0 if provided |
| saleEndsAt | Optional ISO datetime string |

**Response 201**: Created ticket type object with `status: "enabled"`.

**Response 422** (validation):
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "price: Must be greater than 0" } }
```

**Response 403** (non-admin):
```json
{ "error": { "code": "FORBIDDEN", "message": "Admin access required" } }
```

### PATCH /api/admin/tickets/:id — Update ticket type (admin)

**Auth**: Required (authMiddleware + adminMiddleware).

**Request Body** (partial — all fields optional but at least one required):
```json
{
  "name": "VIP Plus",
  "price": 85000.00,
  "quantityTotal": 150,
  "maxPerUser": 4,
  "saleEndsAt": "2026-08-15T23:59:00Z"
}
```

**Validation**:
| Field | Rule |
|-------|------|
| name | Optional, non-empty string |
| description | Optional string |
| price | Optional, must be > 0 |
| quantityTotal | Optional integer, must be > 0 AND >= current quantitySold |
| maxPerUser | Optional integer, must be > 0 if provided |
| saleEndsAt | Optional ISO datetime or null |

**Response 200**: Updated ticket type object.

**Response 422** (quantity < sold):
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "quantityTotal: Cannot be lower than current sold tickets (50)" } }
```

**Behavior**: At least one field required. `saleEndsAt: null` clears the value.

### PATCH /api/admin/tickets/:id/status — Change ticket type status (admin)

**Auth**: Required (authMiddleware + adminMiddleware).

**Request Body**:
```json
{
  "status": "disabled"
}
```

**Validation**: `status` must be one of `enabled`, `disabled`, `blocked`.

**Response 200**: Updated ticket type object with new status.

**Behavior**: Any state can transition to any other state. Idempotent — setting same status returns OK.
