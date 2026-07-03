# GET /api/admin/me

Returns current admin profile and role. Used by `useAdmin()` hook to bootstrap role-aware UI.

## Request

```
GET /api/admin/me
Authorization: Bearer <jwt>
```

## Response 200

```json
{
  "id": "uuid",
  "email": "admin@example.com",
  "name": "Admin Name",
  "role": "super_admin"
}
```

## Response 401

```json
{ "error": "Unauthorized" }
```

## Response 403

```json
{ "error": "Forbidden: Admin access required" }
```
