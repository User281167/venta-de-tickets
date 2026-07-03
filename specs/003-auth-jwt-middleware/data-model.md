# Data Model: Express Auth Middleware (JWT Verification)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Entities

### AuthPayload

The authenticated user identity carried through the request after JWT verification.

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `id` | `string` (UUID) | JWT `sub` claim | Matches `auth.users.id` and `public.users.id` |
| `email` | `string` | JWT `email` claim | User's email from Supabase Auth |

**Validation rules:**
- `id` must be a valid UUID (v4)
- `email` must be a valid email string

**State transitions:** N/A — immutable for the lifetime of the request.

**Relationships:**
- `AuthPayload.id` == `Admin.id` (for admin middleware) — FK equivalence guaranteed by Supabase Auth → `public.users` → `admins` sync trigger.

### AuthErrorResponse

Standard error payload returned by the error handler middleware for auth failures.

| Field | Type | Description |
|-------|------|-------------|
| `error.code` | `string` | Machine-readable code: `"UNAUTHORIZED"` or `"FORBIDDEN"` |
| `error.message` | `string` | Human-readable description (no stack traces or secrets) |

**Example:**
```json
{ "error": { "code": "UNAUTHORIZED", "message": "Invalid or expired token" } }
```

**Validation rules:**
- Never expose `message` from caught exceptions (leaked internals)
- `code` maps directly to HTTP status: `UNAUTHORIZED` → 401, `FORBIDDEN` → 403

### Admin (reference)

Already defined in Prisma schema (`backend/prisma/schema.prisma`):

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` (UUID) | PK, matches `auth.users.id` |
| `fullName` | `String` | Human-readable name |
| `email` | `String` | Unique, matches Supabase Auth email |
| `role` | `AdminRole` (enum) | `super_admin`, `organizer`, `staff`, `checker` |
| `isActive` | `Boolean` | Default `true` |
| `createdAt` | `DateTime` | Auto-timestamp |
| `updatedAt` | `DateTime` | Auto-updated |

**Admin middleware scope:** Only checks existence (any role, `isActive = true`). Sub-role authorization is out of scope.

## Contracts

### Auth Middleware

**Input:** `Authorization: Bearer <token>` header
**Success:** Populates `req.user` with `AuthPayload`, calls `next()`
**Failure:** Throws `UnauthorizedError`

| Error | Condition | HTTP Status |
|-------|-----------|-------------|
| Missing header | No `Authorization` header | 401 |
| Wrong scheme | Not `Bearer` | 401 |
| Empty token | `Bearer ` with no value | 401 |
| Invalid signature | JWT payload tampered or wrong key | 401 |
| Expired | `exp` claim in the past | 401 |
| Missing claims | No `sub` or `email` in payload | 401 |

### Admin Middleware

**Precondition:** `auth.middleware` has already run (`req.user` exists)
**Input:** `req.user.id` (UUID)
**Success:** Calls `next()` — request proceeds to controller
**Failure:** Throws `ForbiddenError` or `UnauthorizedError`

| Error | Condition | HTTP Status |
|-------|-----------|-------------|
| No auth | `req.user` is undefined (auth middleware didn't run) | 401 |
| Not admin | `req.user.id` not found in `admins` table | 403 |
| DB error | Prisma query fails (connection, constraint) | 500 |

### Error Handler Middleware

**Input:** Thrown error + Express `(err, req, res, next)` signature
**Output:** JSON `{ error: { code, message } }` with matching HTTP status
**Fallback:** Unknown errors → 500 Internal Server Error (generic message)
