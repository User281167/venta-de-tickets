# API Contracts: API-DTO Refactor

## Active Endpoints (have frontend consumers)

### GET /api/auth/session

**Description**: Get current user session
**Auth**: Required (cookie-based Supabase session)
**Response 200**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "client"
}
```
**Response 401**: `null` (no active session)

---

### POST /api/users/me/privacy-acceptance

**Description**: Accept current privacy policy version
**Auth**: Required
**Request**:
```json
{
  "policyVersion": "1.0"
}
```
**Response 201**: `{ "message": "Privacy acceptance recorded" }`
**Response 422**: Validation error

---

### GET /api/admin/me

**Description**: Get admin profile
**Auth**: Required (admin role)
**Response 200**:
```json
{
  "id": "uuid",
  "email": "admin@example.com",
  "fullName": "Admin Name",
  "role": "admin"
}
```
**Response 401/403**: Unauthorized

---

### GET /api/admin/users?page=1&limit=10&search=

**Description**: List users with pagination
**Auth**: Required (admin role)
**Query Params**: `page` (int), `limit` (int, 1-100), `search` (string, optional)
**Response 200**:
```json
{
  "data": [
    { "id": "uuid", "email": "...", "fullName": "...", "phone": null, "cedula": null, "role": "client", "isActive": true, "createdAt": "2026-01-01T00:00:00.000Z" }
  ],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

---

## Broken Endpoints (to remove from frontend)

| Endpoint | Reason | Action |
|----------|--------|--------|
| `GET /api/ticket-types` | No backend route | Remove frontend call |
| `GET /api/events/:eventId` | No events module | Remove frontend call + remove dead import reference |
| `GET /api/admin/:eventId/ticket-types` | No matching admin route | Remove frontend call |
| `POST /api/admin/:eventId/ticket-types` | No matching admin route | Remove frontend call |
| `PATCH /api/admin/ticket-types/:id` | No matching admin route | Remove frontend call |
| `DELETE /api/admin/ticket-types/:id` | No matching admin route | Remove frontend call |
| `GET /api/users/me` | No backend route | Remove or remap to existing |
| `PATCH /api/users/me` | No backend route | Remove or remap to existing |
| `POST /api/surveys/onboarding` | No surveys module | Remove frontend call |
| `GET /api/admin/surveys/onboarding` | No surveys module | Remove frontend call |

---

## Unused Backend Endpoints (no frontend caller — keep)

- Full `GET /api/me/*` (personal-info, tickets, payments)
- `GET /api/tickets/*` (public)
- `GET/POST/PATCH /api/admin/tickets/*`
- `POST /api/admin/users` (create), `POST /api/admin/users/batch`, `PATCH /api/admin/users/:id`
- `GET /api/admin/payments/*`, `POST /api/admin/sales`
- `POST /api/checkout`, `GET /api/payments/:id/status`
- `POST /api/internal/checkin` (whatsapp-bot)

These endpoints have valid backend implementations and should not be removed. DTOs for these can be added incrementally when frontend integration is built.
