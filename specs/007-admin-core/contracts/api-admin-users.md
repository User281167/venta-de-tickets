# GET /api/admin/users

Paginated user list with search. Restricted to `super_admin` and `organizer`.

## Request

```
GET /api/admin/users?page=1&limit=20&search=john
Authorization: Bearer <jwt>
```

## Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | int | 1 | Page number (1-indexed) |
| limit | int | 20 | Items per page (max 100) |
| search | string | — | Filter by name or email (case-insensitive contains) |

## Response 200

```json
{
  "data": [
    { "id": "uuid", "name": "John Doe", "email": "john@example.com" },
    { "id": "uuid", "name": "Jane Smith", "email": "jane@example.com" }
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

## Response 401

```json
{ "error": "Unauthorized" }
```

## Response 403

```json
{ "error": "Forbidden: Insufficient permissions" }
```
