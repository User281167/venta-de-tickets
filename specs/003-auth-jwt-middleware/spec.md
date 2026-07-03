# Feature Specification: Express Auth Middleware (JWT Verification)

**Feature Branch**: `003-auth-jwt-middleware`

**Created**: 2026-06-30

**Status**: Draft

**Input**: User description: "Express backend middleware that validates Supabase-issued JWTs on protected routes and attaches the authenticated identity to the request."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - API client accesses a protected route with a valid token (Priority: P1)

A frontend or mobile client sends a request to a backend route marked as protected, carrying a valid unexpired Supabase JWT in the `Authorization` header. The middleware verifies the token signature locally, extracts the user identity, and forwards the request to the controller with `req.user` populated.

**Why this priority**: P1 — this is the core use case; without it no protected route works.

**Independent Test**: Can be fully tested by sending a signed JWT with valid claims to any protected route and verifying the controller receives `req.user.id` matching the token's `sub` claim.

**Acceptance Scenarios**:

1. **Given** a valid unexpired Supabase JWT signed with the project's `SUPABASE_JWT_SECRET`, **When** the client sends a request to a protected route with `Authorization: Bearer <token>`, **Then** the request reaches the controller and `req.user` contains `{ id, email }` matching the token's `sub` and `email` claims.
2. **Given** a valid JWT where `sub` is a UUID that exists in the `users` table, **When** the request passes through auth middleware, **Then** `req.user.id` equals that UUID and no database query was made to fetch user data.

---

### User Story 2 - API client accesses a protected route without a token (Priority: P1)

A client sends a request without the `Authorization` header, or with a malformed header. The middleware rejects the request before it reaches any controller.

**Why this priority**: P1 — security boundary; unauthenticated requests must never reach business logic.

**Independent Test**: Can be fully tested by sending requests with missing, empty, or malformed `Authorization` headers and confirming 401 responses.

**Acceptance Scenarios**:

1. **Given** a request with no `Authorization` header, **When** it reaches a protected route, **Then** the response is `401 Unauthorized` and no controller logic executes.
2. **Given** a request with `Authorization: Bearer ` (empty token), **When** it reaches a protected route, **Then** the response is `401 Unauthorized`.
3. **Given** a request with `Authorization: Basic <base64>` (wrong scheme), **When** it reaches a protected route, **Then** the response is `401 Unauthorized`.

---

### User Story 3 - API client accesses a protected route with an expired or tampered token (Priority: P1)

A client presents a token whose signature is invalid (tampered payload) or whose `exp` claim puts it in the past. The middleware rejects it without contacting Supabase.

**Why this priority**: P1 — security boundary; invalid tokens must be rejected immediately.

**Independent Test**: Can be tested by crafting a JWT with a modified payload (different `sub`) and a JWT with `exp` set to a past timestamp.

**Acceptance Scenarios**:

1. **Given** a JWT with an invalid signature (payload modified after issuance), **When** the client sends it to a protected route, **Then** the response is `401 Unauthorized`.
2. **Given** a JWT whose `exp` claim is in the past, **When** the client sends it to a protected route, **Then** the response is `401 Unauthorized`.

---

### User Story 4 - Admin user accesses an admin-only route (Priority: P2)

A client with a valid user JWT requests an admin-only route. The `admin.middleware` runs after `auth.middleware`, checks `req.user.id` against the `admins` table, and either grants access (if found) or returns 403.

**Why this priority**: P2 — admin functionality is secondary to basic auth but required for staff-facing features.

**Independent Test**: Can be tested by calling an admin route with a valid user token and confirming 403 for non-admin users, or success for admin users.

**Acceptance Scenarios**:

1. **Given** a valid user JWT whose `sub` is present in the `admins` table, **When** the client requests an admin-only route, **Then** the response succeeds and the controller receives `req.user.id` populated.
2. **Given** a valid user JWT whose `sub` is NOT present in the `admins` table, **When** the client requests an admin-only route, **Then** the response is `403 Forbidden`.

---

### Edge Cases

- What happens when the `Authorization` header contains multiple `Bearer` tokens?
- How does the system handle a JWT with missing `sub` or `email` claims?
- How does the system handle a JWT signed with a different secret (e.g., old key rotation)?
- What happens when the `admins` table is unreachable during `admin.middleware` execution?
- What happens when `SUPABASE_JWT_SECRET` environment variable is missing or empty at startup?
- What happens if the token contains valid claims but the `sub` UUID does not exist in the `users` table? (FR-7 states no user table query on every request — this is acceptable, the controller or service layer can handle missing profiles.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST reject requests to protected routes that lack an `Authorization` header with a `401 Unauthorized` response before any controller logic executes.
- **FR-002**: System MUST reject requests with a malformed `Authorization` header (missing `Bearer` scheme, empty token value) with a `401 Unauthorized` response.
- **FR-003**: System MUST verify the JWT signature locally using the project's Supabase JWT secret — no network call to Supabase Auth per request.
- **FR-004**: System MUST reject expired JWTs (where the current time exceeds the `exp` claim) with a `401 Unauthorized` response.
- **FR-005**: System MUST reject JWTs with an invalid signature (tampered payload or wrong signing key) with a `401 Unauthorized` response.
- **FR-006**: On successful JWT verification, system MUST populate `req.user` with `{ id: string, email: string }` extracted from the JWT's `sub` and `email` claims respectively.
- **FR-007**: System MUST provide an admin middleware that, after successful auth middleware, checks whether `req.user.id` exists in the `admins` table via the repository layer.
- **FR-008**: System MUST return `403 Forbidden` from admin middleware when `req.user.id` is not found in the `admins` table.
- **FR-009**: System MUST return `500 Internal Server Error` from admin middleware if the `admins` table query fails (database unreachable, etc.).

### Key Entities

- **User (JWT principal)**: An authenticated identity identified by the UUID in the JWT's `sub` claim. The same UUID exists in the `public.users` table (guaranteed by the DB trigger on Supabase Auth sign-up). Carried through the request as `req.user`.
- **Admin**: A user whose UUID is registered in the `admins` table. Admins have access to routes gated by `admin.middleware`. Details of admin sub-roles are out of scope for this spec.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A request with a valid unexpired JWT reaches the controller with `req.user.id` populated in under 10ms (local verification only, no external network call).
- **SC-002**: A request without a valid token is rejected at the middleware layer and never reaches the controller — 100% of protected routes enforce this.
- **SC-003**: Admin middleware correctly distinguishes admin users from regular users — 100% of requests to admin routes are either granted or denied with the correct status code (200 vs 403).
- **SC-004**: Zero network calls to Supabase Auth are made during JWT verification across all protected routes.
- **SC-005**: System returns consistent error response format for all auth failures (401 with descriptive but secure error messages, no stack traces or internal details leaked).

## Assumptions

- The `SUPABASE_JWT_SECRET` environment variable is configured in all deployment environments (development, staging, production).
- The Supabase Auth trigger that copies `auth.users` → `public.users` on sign-up is already in place and correctly syncs the UUID.
- Frontend is responsible for token refresh via `@supabase/ssr` automatic refresh — no backend token refresh endpoint is needed.
- Admin middleware runs in the same request pipeline as auth middleware and depends on `req.user` being already populated.
- Admin sub-role permissions (super_admin, organizer, etc.) are not needed in this iteration — the admin middleware checks only membership in the `admins` table.
- Error responses use a consistent JSON structure: `{ "error": { "code": "UNAUTHORIZED"|"FORBIDDEN", "message": "..." } }`.
