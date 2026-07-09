# Feature Specification: Admin User Management

**Feature Branch**: `002-admin-user-management`

**Created**: 2026-07-08

**Status**: Draft

**Input**: User description: "Admin module for user management: list users with pagination and filter, add single client with Supabase auth, add multiple clients in batch, modify client info including cedula reassignment, change role (admin/checker/client), block/unblock user. Only admin role (not super_admin). Some features partially exist but need DTO fixes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Admin lists users with pagination and filter (Priority: P1)

Admin views paginated list of all users with search filter. Response includes cedula, phone, isActive status.

**Why this priority**: Existing implementation exists but DTO missing key fields. Quick fix enables proper client management.

**Independent Test**: Admin calls GET with page/limit params. Response contains paginated user list with all required fields.

**Acceptance Scenarios**:

1. **Given** an authenticated admin, **When** they GET `/api/admin/users?page=1&limit=20`, **Then** response includes `{ data, total, page, limit }` with users containing id, email, fullName, phone, cedula, role, isActive, createdAt.
2. **Given** an authenticated admin, **When** they GET with `?search=juan`, **Then** response filters by fullName or email (case-insensitive).
3. **Given** an authenticated admin, **When** they exceed `limit=100`, **Then** limit is capped at 100.

---

### User Story 2 — Admin adds a single client account (Priority: P1)

Admin creates a new client user: Supabase Auth account is created, user record inserted with personal info, all in one endpoint.

**Why this priority**: Core admin workflow — onboarding clients manually requires creating auth + profile atomically.

**Independent Test**: Admin POSTs with email, password, fullName, cedula. System creates Supabase Auth user + Prisma user record. GET list shows new user.

**Acceptance Scenarios**:

1. **Given** an admin creating a client, **When** they POST with valid email, password, fullName, cedula, **Then** Supabase Auth user is created and Prisma user record is inserted with role=client.
2. **Given** an admin creating a client, **When** email already exists in Supabase, **Then** endpoint returns conflict error.
3. **Given** an admin creating a client, **When** cedula already exists in Prisma (unique), **Then** endpoint returns conflict error before creating auth user.

---

### User Story 3 — Admin adds multiple clients in batch (Priority: P2)

Admin creates multiple client accounts in one request. Each user gets a Supabase Auth account + Prisma record.

**Why this priority**: Bulk onboarding saves time for events with many new clients.

**Independent Test**: Admin POSTs array of users. All get created. If any duplicate email/cedula detected, entire batch rejected with error listing conflicts.

**Acceptance Scenarios**:

1. **Given** an admin, **When** they POST an array of 3 valid users, **Then** all 3 are created (Supabase Auth + Prisma records).
2. **Given** an admin, **When** one email in the batch already exists, **Then** entire batch is rejected with error detailing which entries conflict.
3. **Given** an admin, **When** one cedula in the batch is already taken, **Then** entire batch is rejected.

---

### User Story 4 — Admin modifies client account (Priority: P2)

Admin edits client info: updates mutable fields, can reassign cedula if no other user uses it, changes role (admin/checker/client, not super_admin), toggles isActive to block/unblock.

**Why this priority**: Client lifecycle management — corrections, role changes, and blocking.

**Independent Test**: Admin PATCHs a user. Fields update. Cedula changes only if available. Role changes reflected. Blocked user cannot authenticate.

**Acceptance Scenarios**:

1. **Given** an admin modifying a user, **When** they update fullName and phone, **Then** fields are updated.
2. **Given** an admin modifying a user, **When** they set a new cedula not used by another user, **Then** cedula updates.
3. **Given** an admin modifying a user, **When** they set a cedula already used by another user, **Then** error returned (cedula must be unique).
4. **Given** an admin modifying a user, **When** they change role to `admin`, `checker`, or `client`, **Then** role updates in Prisma + Supabase Auth app_metadata.
5. **Given** an admin modifying a user, **When** they attempt to set role to `super_admin`, **Then** request rejected.
6. **Given** an admin modifying a user, **When** they set `isActive: false`, **Then** user is blocked.

---

### Edge Cases

- What happens when admin tries to update a non-existent user?
- What happens when Supabase Auth creation succeeds but Prisma insert fails? (Should rollback or clean up)
- How does batch creation handle mixed valid/invalid entries?
- What happens when admin modifies own account? (Should be allowed for non-role changes)
- Cedula is nullable — what if user has no cedula and admin tries to set one? (Always allowed)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide GET `/api/admin/users` with pagination (page, limit) and search filter.
- **FR-002**: GET response MUST include: id, email, fullName, phone, cedula, role, isActive, createdAt.
- **FR-003**: System MUST provide POST `/api/admin/users` to create single client with Supabase Auth + Prisma record.
- **FR-004**: System MUST check email uniqueness in Supabase Auth AND cedula uniqueness in Prisma before creating.
- **FR-005**: System MUST provide POST `/api/admin/users/batch` to create multiple clients atomically.
- **FR-006**: Batch endpoint MUST reject entire batch if any email or cedula conflict exists.
- **FR-007**: System MUST provide PATCH `/api/admin/users/:id` to modify user fields.
- **FR-008**: Cedula reassignment MUST be allowed only if no other user has that cedula.
- **FR-009**: Role changes MUST be restricted to `admin`, `checker`, `client` — never `super_admin`.
- **FR-010**: Role change MUST update both Prisma record and Supabase Auth app_metadata.
- **FR-011**: System MUST allow toggling `isActive` to block/unblock user.
- **FR-012**: All admin endpoints MUST require role `admin` (not `super_admin`).

### Key Entities

- **User**: Id, email, fullName, phone, cedula (unique), role (enum), isActive, createdAt.
- **Supabase Auth**: Linked by matching user ID. Role stored in `app_metadata.role`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can list users with filters in under 2 seconds for 10k records.
- **SC-002**: Single client creation completes in under 3 seconds (including Supabase Auth call).
- **SC-003**: Batch creation of 20 users completes in under 15 seconds.
- **SC-004**: Cedula uniqueness enforced 100% — no duplicate cedula scenario exists.
- **SC-005**: Role changes to super_admin are rejected 100% of the time.
- **SC-006**: Blocked user (`isActive=false`) status is immediately reflected in list response.

## Assumptions

- Supabase Admin client (`supabaseAdmin`) is already configured and available in `shared/supabase/admin-client.ts`.
- Supabase Auth user creation uses `supabaseAdmin.auth.admin.createUser()`.
- Role syncing between Prisma and Supabase Auth `app_metadata` is required for JWT claims.
- Batch creation processes users sequentially (to respect rate limits) or in limited parallel.
- `super_admin` role exists but is reserved for system setup — never assignable via API.
