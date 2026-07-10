# Data Model: API-DTO Refactor

## DTO Entities (frontend `shared/dto/`)

### User Session

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string (UUID) | yes | Supabase user ID |
| email | string | yes | User email |
| role | 'client' \| 'admin' | yes | User role from `admins`/`users` tables |

**Source**: `GET /api/auth/session` response
**Zod schema**: `sessionUserSchema` → `SessionUser` type

---

### Admin Profile

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string (UUID) | yes | Admin ID |
| email | string | yes | Admin email |
| fullName | string | yes | Admin full name |
| role | 'admin' \| 'checker' | yes | Admin role |

**Source**: `GET /api/admin/me` response
**Zod schema**: `adminProfileSchema` → `AdminProfile` type

---

### Privacy Acceptance

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| policyVersion | string | yes | Version of privacy policy accepted |
| acceptedAt | string (ISO datetime) | no | Auto-set by server |

**Source**: `POST /api/users/me/privacy-acceptance` request
**Zod schema**: `privacyAcceptanceReqSchema` → `PrivacyAcceptanceReq` type

---

### User (Admin List)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string (UUID) | yes | User ID |
| email | string | yes | User email |
| fullName | string | yes | User full name |
| phone | string | no | Nullable |
| cedula | string | no | Nullable |
| role | 'client' \| 'admin' | yes | User role |
| isActive | boolean | yes | Account active status |
| createdAt | string (ISO datetime) | yes | Creation timestamp |

**Source**: `GET /api/admin/users` response items
**Zod schema**: `userListResponseSchema` → `UserListResponse` type

---

### Pagination Params

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| page | number | no | 1 | Page number |
| limit | number | no | 10 | Items per page |
| search | string | no | — | Search query |

**Zod schema**: `paginationParamsSchema` → `PaginationParams` type

---

### Paginated Response Wrapper

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| data | T[] | yes | Array of items |
| total | number | yes | Total items count |
| page | number | yes | Current page |
| limit | number | yes | Items per page |
| totalPages | number | yes | Total pages |

**Zod schema**: `paginatedResponseSchema(T)` → generic type

---

### Error Response

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| error.code | string | yes | Error code (e.g., VALIDATION_ERROR) |
| error.message | string | yes | Human-readable error message |

**Zod schema**: `apiErrorSchema` → `ApiError` type

---

## Validation Rules

- **SessionUser.email**: valid email format, max 255 chars
- **SessionUser.role**: enum 'client' | 'admin'
- **AdminProfile.email**: valid email format
- **AdminProfile.role**: enum 'admin' | 'checker'
- **PrivacyAcceptance.policyVersion**: non-empty string, max 20 chars
- **PaginationParams.page**: positive integer
- **PaginationParams.limit**: integer 1-100
- **User fullName**: non-empty string, max 100 chars
- **User phone**: nullable, regex pattern for Colombian phone if present
- **Error code**: non-empty string
- **Error message**: non-empty string
