# Tasks: Module Cleanup & Unit Tests

**Input**: Design documents from `/specs/003-cleanup-and-tests/`

## Phase 1: Setup

**Purpose**: No project initialization needed — project exists. Just update feature tracking.

- [X] T001 Update `.specify/feature.json` to point to `specs/003-cleanup-and-tests`

---

## Phase 2: Foundational

**Purpose**: Blocking prerequisites — understanding current state before cleanup.

- [X] T002 [P] Review existing tests in `backend/test/` — identify patterns (vi.mock, supertest, auth setup) to follow
- [X] T003 [P] Review `backend/src/app.ts` for all route registrations to understand mount paths

---

## Phase 3: User Story 1 — Cleanup duplicate `/me` routes from users module (P1)

**Goal**: Remove `GET /me` and `PATCH /me` from users module — these are now in `me` module.

**Independent Test**: API calls to `GET /api/users/me` and `PATCH /api/users/me` return 404 after cleanup.

- [X] T004 [US1] Remove `getMe` and `updateMe` imports/calls from `backend/src/modules/users/users.routes.ts` — keep only privacy routes
- [X] T005 [US1] Remove `getMe` and `updateMe` functions from `backend/src/modules/users/users.controller.ts`
- [X] T006 [US1] Remove `getMe` and `updateMe` functions from `backend/src/modules/users/users.service.ts` — also remove `surveysRepo` cross-module import and `onboarding_survey_done` from `getMe` return (function will be removed entirely)
- [X] T007 [US1] Remove `UpdateUserInput` import from `backend/src/modules/users/users.service.ts` (no longer needed)
- [X] T008 [P] [US1] Remove unused `ForbiddenError` import from `backend/src/modules/users/users.service.ts`
- [X] T009 [US1] Update `backend/test/users.api.test.ts` — remove `GET /api/users/me` and `PATCH /api/users/me` test suites; keep privacy tests only; remove `update` mock from vi.mock since it's no longer used by remaining privacy routes
- [X] T010 [US1] Run `npm test` (Vitest) to confirm remaining privacy tests pass and deleted route tests are gone

---

## Phase 4: User Story 2 — Remove surveys module (P1)

**Goal**: Delete dead surveys module and all references.

**Independent Test**: `GET /api/admin/surveys/onboarding` returns 404 after removal; build succeeds with no `SurveyType`/`surveyResponse` references.

- [X] T011 [P] [US2] Delete entire `backend/src/modules/surveys/` directory (6 files)
- [X] T012 [P] [US2] Remove `surveysRouter` import and `app.use('/api/surveys', ...)` from `backend/src/app.ts`
- [X] T013 [P] [US2] Remove `listOnboardingSurveys` handler from `backend/src/modules/admins/admins.controller.ts` (remove `surveysService` import)
- [X] T014 [P] [US2] Remove `/surveys/onboarding` route from `backend/src/modules/admins/admins.routes.ts`
- [X] T015 [P] [US2] Remove `adminQueryResponses` from `backend/src/modules/admins/admins.service.ts` (unused after route removal)
- [X] T016 [P] [US2] Delete `backend/test/surveys.api.test.ts`
- [X] T017 [P] [US2] Delete `backend/test/surveys.validators.test.ts`
- [X] T018 [P] [US2] Remove duplicate migration directory `backend/prisma/migrations/20260709004345_add_personal_info_fields/`
- [X] T019 [US2] Run `npx tsc --noEmit` to verify TypeScript compiles without errors after surveys removal

---

## Phase 5: User Story 3 — Unit tests for me module (P2)

**Goal**: Comprehensive test coverage for all `me` module endpoints with mocked dependencies.

**Independent Test**: `npx vitest run test/me.api.test.ts` passes all tests.

### Create test file

- [X] T020 [US3] Create `backend/test/me.api.test.ts` with vi.mock for `auth.service.js` (verifyToken) and `me.repository.js` (findByUserId, upsert)

### Auth & role guard tests

- [X] T021 [P] [US3] Test: `GET /api/me` returns 401 without Authorization header
- [X] T022 [P] [US3] Test: `GET /api/me` returns 401 with malformed token
- [X] T023 [P] [US3] Test: `GET /api/me` returns 401 with invalid/expired token (vi.mocked verifyToken rejects)
- [X] T024 [P] [US3] Test: `GET /api/me` returns 200 with user object when valid token provided
- [X] T025 [P] [US3] Test: `PUT /api/me/personal-info` returns 401 without auth
- [X] T026 [P] [US3] Test: `PUT /api/me/personal-info` returns 403 FORBIDDEN when role is not 'client'
- [X] T027 [P] [US3] Test: `PATCH /api/me/personal-info` returns 403 FORBIDDEN when role is not 'client'

### GET /personal-info tests

- [X] T028 [US3] Test: `GET /api/me/personal-info` returns 200 with user data when user exists (mock findByUserId returns full data)
- [X] T029 [US3] Test: `GET /api/me/personal-info` returns 200 with all-null fields when user not found (mock findByUserId returns null)

### PUT /personal-info (first time) tests

- [X] T030 [US3] Test: `PUT /api/me/personal-info` returns 422 VALIDATION_ERROR with empty body
- [X] T031 [US3] Test: `PUT /api/me/personal-info` returns 422 VALIDATION_ERROR with invalid cedula (non-numeric)
- [X] T032 [US3] Test: `PUT /api/me/personal-info` returns 422 VALIDATION_ERROR with cedula too short (< 8 digits)
- [X] T033 [US3] Test: `PUT /api/me/personal-info` returns 422 VALIDATION_ERROR with cedula too long (> 15 digits)
- [X] T034 [US3] Test: `PUT /api/me/personal-info` returns 200 with data when valid body provided (first time — mock findByUserId returns nulls, mock upsert returns saved data)

### PATCH /personal-info (update) tests

- [X] T035 [US3] Test: `PATCH /api/me/personal-info` returns 422 VALIDATION_ERROR with empty body
- [X] T036 [US3] Test: `PATCH /api/me/personal-info` returns 422 CEDULA_INVALIDATION when cedula already set and different value provided (mock findByUserId returns existing cedula)
- [X] T037 [US3] Test: `PATCH /api/me/personal-info` returns 200 when updating only fullName (no cedula change)
- [X] T038 [US3] Test: `PATCH /api/me/personal-info` returns 200 when cedula is same as existing value (no-op)
- [X] T039 [US3] Run `npx vitest run test/me.api.test.ts` — assert all 18+ tests pass

---

## Phase 6: User Story 4 — Unit tests for admin module (P2)

**Goal**: Comprehensive test coverage for all `admin` module endpoints with mocked dependencies.

**Independent Test**: `npx vitest run test/admins.api.test.ts` passes all tests.

### Create test file

- [X] T040 [US4] Create `backend/test/admins.api.test.ts` with vi.mock for:
  - `auth.service.js` (verifyToken)
  - `admins.repository.js` (findAll, countAll, findByEmail, findByCedula, findById, create, update, updateRole)
  - `shared/supabase/admin-client.js` (supabaseAdmin with auth.admin.createUser and auth.admin.updateUserById)

### Auth & role guard tests

- [X] T041 [P] [US4] Test: `GET /api/admin/users` returns 401 without auth
- [X] T042 [P] [US4] Test: `GET /api/admin/users` returns 403 FORBIDDEN for checker role
- [X] T043 [P] [US4] Test: `GET /api/admin/users` returns 403 FORBIDDEN for client role
- [X] T044 [P] [US4] Test: `GET /api/admin/me` returns 200 with admin profile for admin role

### GET /admin/users tests

- [X] T045 [US4] Test: `GET /api/admin/users` returns 200 with paginated list (mock findAll + countAll)
- [X] T046 [US4] Test: `GET /api/admin/users?search=term` passes search param to repository
- [X] T047 [US4] Test: `GET /api/admin/users?page=2&limit=10` passes pagination params correctly

### POST /admin/users (create individual) tests

- [X] T048 [US4] Test: `POST /api/admin/users` returns 422 VALIDATION_ERROR with empty body
- [X] T049 [US4] Test: `POST /api/admin/users` returns 422 VALIDATION_ERROR with invalid email
- [X] T050 [US4] Test: `POST /api/admin/users` returns 422 VALIDATION_ERROR with short password (< 6 chars)
- [X] T051 [US4] Test: `POST /api/admin/users` returns 409 CONFLICT when email already exists (mock findByEmail returns existing user)
- [X] T052 [US4] Test: `POST /api/admin/users` returns 409 CONFLICT when cedula already exists (mock findByEmail returns null, mock findByCedula returns existing user)
- [X] T053 [US4] Test: `POST /api/admin/users` returns 502 AUTH_ERROR when Supabase user creation fails (mock supabaseAdmin.auth.admin.createUser returns error)
- [X] T054 [US4] Test: `POST /api/admin/users` returns 201 with user when valid data provided

### POST /admin/users/batch tests

- [X] T055 [US4] Test: `POST /api/admin/users/batch` returns 422 VALIDATION_ERROR with empty array (min 1)
- [X] T056 [US4] Test: `POST /api/admin/users/batch` returns 422 VALIDATION_ERROR with 51 users (max 50)
- [X] T057 [US4] Test: `POST /api/admin/users/batch` returns 409 CONFLICT when any email already exists
- [X] T058 [US4] Test: `POST /api/admin/users/batch` returns 409 CONFLICT when any cedula already exists
- [X] T059 [US4] Test: `POST /api/admin/users/batch` returns 201 with array when all valid

### PATCH /admin/users/:id tests

- [X] T060 [US4] Test: `PATCH /api/admin/users/123` returns 422 VALIDATION_ERROR with empty body (at least one field required)
- [X] T061 [US4] Test: `PATCH /api/admin/users/999` returns 404 NOT_FOUND when user doesn't exist (mock findById returns null)
- [X] T062 [US4] Test: `PATCH /api/admin/users/123` returns 409 CONFLICT when cedula already in use by different user (mock findById returns user, mock findByCedula returns other user)
- [X] T063 [US4] Test: `PATCH /api/admin/users/123` returns 422 VALIDATION_ERROR when role is 'super_admin'
- [X] T064 [US4] Test: `PATCH /api/admin/users/123` returns 200 when updating fullName
- [X] T065 [US4] Test: `PATCH /api/admin/users/123` returns 200 when updating role to 'checker'
- [X] T066 [US4] Test: `PATCH /api/admin/users/123` returns 200 when updating isActive
- [X] T067 [US4] Run `npx vitest run test/admins.api.test.ts` — assert all 25+ tests pass

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Ensure everything works together and old test files don't cause issues.

- [X] T068 Run `npx vitest run` to ensure all tests pass (existing + new)
- [ ] T069 Run `npx tsc --noEmit` to verify TypeScript compilation
- [X] T070 [P] Remove unused `admins/index.ts` exports (`findAll`, `countAll` from repository — no longer needed after surveys removal)
- [X] T071 [P] Remove dead `backend/src/modules/admins/admin-ping.controller.ts` (never imported anywhere)
- [X] T072 Final review: confirm no stale references to surveys or deleted users routes remain

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: No dependencies
- **US1 — Cleanup users (Phase 3)**: Independent
- **US2 — Remove surveys (Phase 4)**: Independent — can run in parallel with US1
- **US3 — me tests (Phase 5)**: Independent — no dependency on cleanup phases
- **US4 — admin tests (Phase 6)**: Independent — no dependency on cleanup phases
- **Polish (Phase 7)**: Depends on all other phases

### Parallel Opportunities

- T002 ↔ T003 (Phase 2) — can run in parallel
- T004–T010 (US1) — sequential within story, but independent of US2
- T011–T018 (US2) — all [P] tasks can run in parallel
- All auth/role guard tests within a story (marked [P]) can run in parallel
- T020–T039 (US3) — tests can be written independently of T040–T067 (US4)
- T070 ↔ T071 (Phase 7) — can run in parallel

### Implementation Strategy

1. **Phase 1–2**: Quick review (minutes)
2. **Phase 3 (US1) + Phase 4 (US2)**: Can be done in parallel by different developers
3. **Phase 5 (US3) + Phase 6 (US4)**: Can be done in parallel
4. **Phase 7**: Final validation

## Parallel Example: User Story 3 (me tests)

```bash
# Launch all auth/role guard tests together (conceptual — sequential in one file):
Task: "Auth tests — no token, malformed, invalid, valid"
Task: "Role guard — non-client 403 for PUT/PATCH personal-info"

# Launch all personal-info GET tests:
Task: "GET with existing user — 200 + data"
Task: "GET with no user — 200 + nulls"
```

## Parallel Example: User Story 4 (admin tests)

```bash
# Launch auth/role guard tests:
Task: "Auth — no token 401"
Task: "Role guard — checker 403, client 403"

# Launch CRUD tests independently:
Task: "POST create user — all error paths + success"
Task: "POST batch — all error paths + success"
Task: "PATCH update user — all error paths + success"
```

---

## Notes

- Use `vi.mock` at top level (traditional Vitest hoisting), not factory syntax
- Mock `require-role.middleware.ts` is not possible directly — instead, set `role` in verifyToken return value and `resolveRole` mock, since auth middleware reads role from verified token
- For role guard tests on `/me/personal-info`, set the verified token's `role` to `'checker'` or `'admin'` — the `requireRole('client')` middleware will check `req.user.role`
- For admin routes, set `role` to `'admin'` for success cases, `'checker'` or `'client'` for 403 cases
- Admin middleware checks `['admin']` only — `super_admin` also gets 403 now
