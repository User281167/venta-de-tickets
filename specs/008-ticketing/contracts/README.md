# API Contracts: Ticketing

Base path for backend API: `/api` (existing).

All endpoints return JSON. Auth via Supabase JWT in `Authorization: Bearer <token>` header.

## Endpoints

### Ticket Types (Admin)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/admin/ticket-types` | super_admin, organizer | List all ticket types |
| `POST` | `/api/admin/ticket-types` | super_admin, organizer | Create ticket type |
| `PATCH` | `/api/admin/ticket-types/:id` | super_admin, organizer | Update ticket type |
| `DELETE` | `/api/admin/ticket-types/:id` | super_admin, organizer | Deactivate ticket type |

### Event Page (Public)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/events/:eventId` | None | Get event details + ticket types with availability |

### Reservation

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/tickets/reserve` | Required | Reserve tickets |
| `GET` | `/api/tickets/my-reservations` | Required | Get user's active reservations |

See individual contract files for request/response schemas.
