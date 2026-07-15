# API Contracts: Interfaz moderna para landing y dashboard

This feature consumes existing public and authenticated API endpoints. No new endpoints are required.

## Public endpoints

### `GET /api/tickets?page=1&limit=50`

Used by the landing page to display active ticket types / events.

**Request**: Query parameters `page` and `limit`.

**Response**:

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "General",
      "description": "string | null",
      "price": 100000,
      "quantityTotal": 100,
      "quantitySold": 45,
      "maxPerUser": 5,
      "saleEndsAt": "2026-08-01T00:00:00Z",
      "status": "enabled"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50
}
```

**Frontend consumer**: `features/ticket-purchase/api/ticket-purchase.endpoints.ts` → `useActiveTicketTypes`

## Authenticated endpoints

### `GET /api/me`

Returns the current user profile and privacy consent status.

**Response**:

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": null,
    "fullName": "Ana Pérez",
    "phone": "+573001234567",
    "cedula": "1234567890",
    "address": null,
    "dateOfBirth": "1995-05-15"
  },
  "consentStatus": {
    "required": true,
    "acceptedAt": null,
    "policyVersion": "1.0"
  }
}
```

**Frontend consumer**: `features/users/api/users.client.ts` → `useProfile`

### `GET /api/me/tickets?page=1&limit=20`

Returns the current user's tickets.

**Response**:

```json
{
  "data": [ /* Ticket objects */ ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

**Frontend consumer**: `features/users/api/tickets.client.ts` → `useMyTickets`

### `GET /api/me/payments?page=1&limit=20`

Returns the current user's payments/orders.

**Response**:

```json
{
  "data": [ /* Payment objects */ ],
  "total": 5,
  "page": 1,
  "limit": 20
}
```

**Frontend consumer**: `features/users/api/payments.client.ts` → `usePayments`

## Notes

- All authenticated endpoints require an `Authorization: Bearer <token>` header.
- Error codes reused from existing `ApiError` mapping (`UNAUTHORIZED`, `VALIDATION_ERROR`, `INTERNAL_ERROR`).
- Dashboard overview will call `fetchMe`, `fetchMyTickets`, and `fetchMyPayments` in parallel using `useQuery` hooks.
