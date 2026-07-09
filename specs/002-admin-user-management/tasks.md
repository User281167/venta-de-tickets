---
description: "Implementation tasks for admin user management"
---

# Tasks: Admin User Management

**Input**: Design documents from `specs/002-admin-user-management/`

**Prerequisites**: spec.md

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`
- **Module**: `backend/src/modules/admins/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Foundation for all user stories — fix role mismatch and middleware

- [x] T001 Update `backend/src/shared/middlewares/admin.middleware.ts`: change `ADMIN_ROLES` to `['admin']` — only `admin` role (Prisma enum) can access admin endpoints. Remove `super_admin`, `organizer`, `staff`, `checker`.
- [x] T002 [P] Update `backend/src/modules/admins/admins.validators.ts`:
  - Change `updateRoleSchema` roles to `z.enum(['admin', 'checker', 'client'])` — remove `super_admin`, `organizer`, `staff`, `checker`
  - Add `createUserSchema`: Zod object with `email` (email string), `password` (min 6), `fullName` (1-150), `cedula` (8-15 digits, optional), `phone` (10-20, nullable, optional)
  - Add `batchCreateUsersSchema`: Zod array of `createUserSchema`, min 1, max 50
  - Add `updateUserSchema`: Zod object with all fields optional, `cedula` optional but checked for uniqueness in service, `role` enum `['admin', 'checker', 'client']` optional, `isActive` boolean optional
- [x] T003 [P] Update `backend/src/modules/admins/admins.types.ts` — align `AdminRole` type with Prisma `UserRole` enum: `'admin' | 'checker' | 'client'`
- [x] T004 [P] Update `backend/src/modules/admins/admins.repository.ts`:
  - Add `selectUserList` constant with: `id`, `email`, `fullName`, `phone`, `cedula`, `role`, `isActive`, `createdAt`
  - Add `create(data)` method: `prisma.user.create({ data, select: selectUserList })`
  - Add `update(id, data)` method: `prisma.user.update({ where: { id }, data, select: selectUserList })`
  - Add `findByEmail(email)` method for duplicate check
  - Add `findByCedula(cedula)` method for duplicate check
  - Update `findById` select to include `cedula`, `phone`, `isActive`

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Update `backend/src/modules/admins/admins.routes.ts`:
  - Replace `requireRole('super_admin', 'organizer')` on `/users` list with `requireRole('admin')`
  - Keep `adminMiddleware` as base (now only allows `admin` role)
  - Add new routes: `POST /users`, `POST /users/batch`, `PATCH /users/:id`
  - Remove the old `requireRole('super_admin')` on role update route
- [x] T006 [P] Update `backend/src/modules/admins/admins.controller.ts`:
  - Add `createUser` handler (parse body with `createUserSchema`, call service)
  - Add `batchCreateUsers` handler (parse body with `batchCreateUsersSchema`, call service)
  - Add `updateUser` handler (parse body with `updateUserSchema`, call service)
  - Add error handling for Zod errors → 422 `VALIDATION_ERROR`
  - Add error handling for conflict errors → 409 `CONFLICT`
- [x] T007 [P] Update `backend/src/modules/admins/admins.service.ts`:
  - Add `createUser(data, ip, userAgent)`:
    1. Check email uniqueness in Prisma (`findByEmail`)
    2. Check cedula uniqueness in Prisma if provided (`findByCedula`)
    3. Create Supabase Auth user via `supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { role: 'client' } })`
    4. Create Prisma user record with same ID as Supabase Auth UID
    5. Create privacy acceptance record
  - Add `batchCreateUsers(dataArray, ip, userAgent)`:
    1. Validate all emails and cedulas unique in DB first (fail-fast)
    2. Create each user sequentially, collect results
    3. If any fails after partial creation, log but continue (best-effort)
  - Add `updateUser(id, data)`:
    1. If cedula provided, check no other user has it (`findByCedula`)
    2. If role provided, update Supabase Auth `app_metadata` AND Prisma record
    3. If isActive provided, update Prisma record
    4. Return updated user DTO

**Checkpoint**: Foundation ready — routes, validators, service methods wired. Role access fixed to `admin` only.

---

## Phase 3: User Story 1 — Admin lists users with pagination and filter (Priority: P1) 🎯 MVP

**Goal**: Admin views paginated user list with complete DTO (cedula, phone, isActive).

**Independent Test**: Admin calls `GET /api/admin/users?page=1&limit=20`. Response includes all required fields. Existing endpoint already works, just DTO fix.

- [x] T008 [P] [US1] Update `findAll` in `backend/src/modules/admins/admins.repository.ts` — use `selectUserList` constant instead of inline select (adds `phone`, `cedula`, `isActive`). Remove `surveyResponses` from select (moved to dedicated endpoint).
- [x] T009 [P] [US1] Update `listUsers` in `backend/src/modules/admins/admins.service.ts` — remove `surveyResponses` mapping. Return raw data from repo directly (DTO now includes all fields).
- [x] T010 [US1] Update `listUsers` controller handler in `backend/src/modules/admins/admins.controller.ts` — verify response shape matches `{ data, total, page, limit }`

**Checkpoint**: Admin can list users with complete DTO. Quick win.

---

## Phase 4: User Story 2 — Admin adds single client (Priority: P1)

**Goal**: Admin creates a client with Supabase Auth + Prisma record in one call.

**Independent Test**: Admin POSTs `{ email, password, fullName, cedula }` to `/api/admin/users`. Supabase Auth user created. User appears in list.

- [x] T011 [P] [US2] Implement `createUser` in `backend/src/modules/admins/admins.repository.ts` — `prisma.user.create({ data: { id: authUserId, email, fullName, cedula, phone, role: 'client' }, select: selectUserList })`
- [x] T012 [P] [US2] Implement `findByEmail` and `findByCedula` in `backend/src/modules/admins/admins.repository.ts`
- [x] T013 [US2] Implement `createUser` in `backend/src/modules/admins/admins.service.ts`:
  1. Check `findByEmail` — if exists → throw conflict error
  2. Check `findByCedula` (if cedula provided) — if exists → throw conflict error
  3. `supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { role: 'client' } })`
  4. Extract user ID from Supabase response
  5. `adminsRepo.create({ id: supabaseUid, email, fullName, cedula, phone, role: 'client' })`
  6. Create privacy acceptance record
- [x] T014 [US2] Wire `createUser` handler to `POST /users` route in `backend/src/modules/admins/admins.routes.ts`
- [x] T015 [US2] Handle Supabase Auth errors in `backend/src/modules/admins/admins.controller.ts` — if auth creation fails, return 502 with error details

**Checkpoint**: Single client creation works end-to-end.

---

## Phase 5: User Story 3 — Admin adds multiple clients in batch (Priority: P2)

**Goal**: Admin creates multiple clients in one request.

**Independent Test**: Admin POSTs array of 3 users to `/api/admin/users/batch`. All appear in list.

- [x] T016 [P] [US3] Implement `batchCreateUsers` in `backend/src/modules/admins/admins.service.ts`:
  1. Collect all emails and cedulas from batch
  2. Pre-check all against DB — if any duplicate, return error listing all conflicts
  3. Process each user sequentially (create auth + prisma), collect successes
  4. Return array of created user DTOs
- [x] T017 [US3] Wire `batchCreateUsers` handler to `POST /users/batch` route in `backend/src/modules/admins/admins.routes.ts`

**Checkpoint**: Batch creation works. All-or-nothing validation.

---

## Phase 6: User Story 4 — Admin modifies client account (Priority: P2)

**Goal**: Admin edits user info, reassigns cedula, changes role (not super_admin), blocks/unblocks.

**Independent Test**: Admin PATCHs user with new phone + role. Fields update. Blocked user shows isActive=false.

- [x] T018 [P] [US4] Implement `update` in `backend/src/modules/admins/admins.repository.ts` — generic update with `selectUserList`
- [x] T019 [US4] Implement `updateUser` in `backend/src/modules/admins/admins.service.ts`:
  1. Check user exists (`findById`) — if not → 404
  2. If cedula in payload: check `findByCedula` returns same user or null — if different user has it → 409 conflict
  3. If role in payload: reject `super_admin` → 422; update Supabase Auth `app_metadata`
  4. If isActive provided: update Prisma record
  5. Return updated user DTO
- [x] T020 [US4] Wire `updateUser` handler to `PATCH /users/:id` route in `backend/src/modules/admins/admins.routes.ts`
- [x] T021 [US4] Add error handling: 404 for not found, 409 for cedula conflict, 422 for invalid role

**Checkpoint**: Full user modification CRUD. Cedula reassignment works. Role syncs with Supabase.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, error consistency, documentation

- [x] T022 [P] Audit `backend/src/modules/admins/admins.controller.ts` — ensure all handlers return consistent `{ error: { code, message } }` format matching `error-handler.middleware.ts`
- [x] T023 [P] Clean up `backend/src/modules/admins/admins.routes.ts` — remove old `requireRole('super_admin', 'organizer')` remnants, confirm only `requireRole('admin')` remains
- [x] T024 Create `backend/src/modules/admins/README.md` documenting:
  - All admin routes with methods, paths, descriptions
  - Request/response shapes for create, batch, update
  - Error codes: `VALIDATION_ERROR` (422), `CONFLICT` (409), `FORBIDDEN` (403), `NOT_FOUND` (404)
  - Role constraints: only `admin` role can access; can assign `admin`, `checker`, or `client`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — fixes middleware, validators, repo
- **Foundational (Phase 2)**: Depends on Setup — wires new routes and service methods
- **US1 (Phase 3)**: Depends on Phase 1 + 2 — simple DTO fix
- **US2 (Phase 4)**: Depends on Phase 1 + 2 — uses new repo/service methods
- **US3 (Phase 5)**: Depends on US2 — builds on single create pattern
- **US4 (Phase 6)**: Depends on Phase 1 + 2 — uses repo update
- **Polish (Phase 7)**: Depends on all user stories

### Parallel Opportunities

- T002, T003, T004: All validator/types/repo changes — parallel
- T006, T007: Controller + service stubs — parallel
- T008, T009: Repo + service for list DTO fix — parallel
- T011, T012: Repo create + findBy methods — parallel
- T018, T022, T023: Repo update + audit + cleanup — parallel

### Within Each User Story

- Validators before service
- Repository before service
- Service before controller
- Controller before routes

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (role fixes + repo helpers)
2. Complete Phase 2: Foundational (route/service stubs)
3. Complete Phase 3: US1 (list with complete DTO)
4. **STOP and VALIDATE**: List endpoint returns all fields correctly
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Role access fixed
2. Add US1 → List with complete DTO → Deploy (MVP!)
3. Add US2 → Single client creation → Deploy
4. Add US3 → Batch client creation → Deploy
5. Add US4 → Client modification → Deploy
6. Add Polish → README + cleanup → Deploy

---

## Parallel Execution Example: User Story 2

```bash
# Launch repository methods together:
Task: "Implement create + findByEmail + findByCedula in admins.repository.ts"

# Then service (depends on repo):
Task: "Implement createUser in admins.service.ts"

# Then controller + route (depends on service):
Task: "Wire createUser handler in admins.controller.ts"
Task: "Wire POST /users route in admins.routes.ts"
```
