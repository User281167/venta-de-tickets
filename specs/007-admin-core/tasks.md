# Tasks: Admin Core

**Input**: specs/007-admin-core/spec.md

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested in spec. QA tasks cover manual verification.

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **Blocked until**: `express-auth-middleware` done (auth JWT middleware from spec 003)
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3, US4)
- Include exact file paths

---

## Phase 1: Setup

**Purpose**: Verify existing infrastructure is ready

- [x] T001 Verify Prisma schema has `admins` model in `backend/prisma/schema.prisma`
- [x] T002 [P] Confirm Supabase Auth email/password sign-in enabled in Supabase dashboard
- [x] T003 [P] Seed test admin(s) in `admins` table for development (insert script or SQL)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend auth infrastructure — admin identity type, repository, middleware chain

**⚠️ No user story work can begin until this phase is complete**

- [x] T004 [P] Define `AdminRole` enum (`super_admin`, `organizer`, `checker`) in `backend/src/modules/admins/admins.types.ts`
- [x] T005 [P] Implement `findById(id)` in `backend/src/modules/admins/admins.repository.ts` — returns full admin row including `role`
- [x] T006 Upgrade `backend/src/shared/middlewares/admin.middleware.ts` from spec 003 stub — query `admins` via Prisma, attach `req.admin` (`id`, `email`, `role`, `name`)
- [x] T007 [P] Implement `requireRole(...roles)` factory in `backend/src/shared/middlewares/require-role.middleware.ts`
- [x] T008 Add `GET /api/admin/me` route + controller in `backend/src/modules/admins/admins.routes.ts` — returns `req.admin`, protected by `admin.middleware`

**Checkpoint**: Backend returns admin profile at `/api/admin/me`. Middleware chain works (admin lookup + role attach + requireRole).

---

## Phase 3: User Story 1 - Admin logs into the system (Priority: P1) 🎯 MVP

**Goal**: Admin can log in via email/password at `/admin/login`, get redirected to `/admin`. Already-authenticated admins skip login.

**Independent Test**: Visit `/admin/login`, submit valid credentials, confirm redirect to `/admin` with admin name/role visible.

### Implementation

- [x] T009 [P] [US1] Implement `signInWithPassword` and `signOut` in `frontend/features/admin-auth/api/admin-auth.client.ts` — reuses existing Supabase browser client
- [x] T010 [P] [US1] Create `useAdmin()` hook in `frontend/features/admin-auth/hooks/useAdmin.ts` — fetches `GET /api/admin/me`, exposes `admin`, `role`, `isLoading`
- [x] T011 [P] [US1] Build `AdminLoginForm` component in `frontend/features/admin-auth/components/AdminLoginForm.tsx` — email/password fields, Zod validation, inline errors
- [x] T012 [US1] Create `frontend/app/admin/login/page.tsx` — renders AdminLoginForm, redirects to `/admin` if already authenticated
- [x] T013 [US1] Create `frontend/middleware.ts` — `/admin/login` accessible to unauthenticated; all other `/admin/*` require valid session, redirect to `/admin/login` if not

**Checkpoint**: Admin can log in and reach `/admin`. Unauthenticated visitors are redirected to login. Already-authenticated admins skip login.

---

## Phase 4: User Story 2 - Admin navigates protected shell (Priority: P1)

**Goal**: After login, admin sees sidebar with role-filtered nav. super_admin/organizer see user list + survey links. checker sees only check-in (future). Logout works.

**Independent Test**: Log in as super_admin → sidebar shows user list, surveys, logout. Log in as checker → sidebar omits user list and surveys.

### Implementation

- [x] T014 [P] [US2] Build `AdminSidebar` component in `frontend/shared/components/AdminSidebar.tsx` — reads role from `useAdmin()`, renders filtered nav links + logout button
- [x] T015 [US2] Create `frontend/app/admin/layout.tsx` — wraps content with AdminSidebar, requires auth
- [x] T016 [US2] Create `frontend/app/admin/page.tsx` — dashboard stub with welcome message and role info

**Checkpoint**: Admin shell renders with role-filtered sidebar. Logout clears session and redirects to `/admin/login`.

---

## Phase 5: User Story 3 - View user list (Priority: P2)

**Goal**: super_admin/organizer can view paginated user list with search by name/email. checker gets 403.

**Independent Test**: Log in as super_admin, navigate to `/admin/usuarios`, search for user by name, confirm paginated results.

### Implementation

- [x] T017 [P] Implement `findAll(page, limit, search?)` in `backend/src/modules/admins/admins.repository.ts` — paginated query on `users` table
- [x] T018 Add `GET /api/admin/users` route + controller in `backend/src/modules/admins/admins.routes.ts` — protected by `admin.middleware` + `requireRole('super_admin', 'organizer')`
- [x] T019 [P] [US3] Create admin users query in `frontend/features/admin-users/api/admin-users.queries.ts` — TanStack Query with pagination
- [x] T020 [P] [US3] Build `UserTable` component in `frontend/features/admin-users/components/UserTable.tsx` — paginated table with search input
- [x] T021 [US3] Create `frontend/app/admin/usuarios/page.tsx` — renders UserTable, restricted to super_admin/organizer

**Checkpoint**: super_admin/organizer sees user list with search + pagination. checker gets 403.

---

## Phase 6: User Story 4 - View onboarding survey responses (Priority: P2)

**Goal**: super_admin/organizer can view onboarding survey responses with user name/email. checker gets 403.

**Independent Test**: Log in as super_admin, navigate to `/admin/encuestas`, confirm user-response pairs display.

### Implementation

- [x] T022 Implement `findAllOnboarding()` in `backend/src/modules/surveys/surveys.repository.ts` — joined query: user name/email + JSONB answers
- [x] T023 Add `GET /api/admin/surveys/onboarding` route + controller in `backend/src/modules/surveys/surveys.routes.ts` — protected by `admin.middleware` + `requireRole('super_admin', 'organizer')`
- [x] T024 [P] [US4] Create admin surveys query in `frontend/features/admin-surveys/api/admin-surveys.queries.ts`
- [x] T025 [P] [US4] Build `SurveyResponsesTable` component in `frontend/features/admin-surveys/components/SurveyResponsesTable.tsx`
- [x] T026 [US4] Create `frontend/app/admin/encuestas/page.tsx` — renders SurveyResponsesTable, restricted to super_admin/organizer

**Checkpoint**: super_admin/organizer sees survey responses. checker gets 403.

---

## Phase 7: QA Verification

**Purpose**: Manual smoke tests across all user stories

- [ ] T027 Verify admin logs in → reaches `/admin` (manual: needs running server)
- [ ] T028 Verify non-admin user JWT hitting `/api/admin/me` → 403 (manual)
- [ ] T029 Verify unauthenticated visitor hitting `/admin/*` → redirect to `/admin/login` (manual)
- [ ] T030 Verify logout clears session → redirects to `/admin/login` (manual)
- [ ] T031 Verify checker role cannot access `/admin/usuarios` or `/admin/encuestas` (server-side 403) (manual)

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T032 [P] Run `quickstart.md` validation steps end-to-end
- [ ] T033 [P] Add error boundaries for admin pages in `frontend/src/app/admin/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — verify infrastructure is ready
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — BLOCKS US2
- **US2 (Phase 4)**: Depends on US1 (shell requires login)
- **US3 (Phase 5)**: Depends on Foundational + US1 (needs admin middleware + login shell)
- **US4 (Phase 6)**: Depends on Foundational + US1 (needs admin middleware + login shell)
- **QA (Phase 7)**: Depends on all user stories complete
- **Polish (Phase 8)**: Depends on QA pass

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no deps on other stories
- **US2 (P1)**: Depends on US1 (needs login to show shell)
- **US3 (P2)**: Depends on US1 (needs auth + admin middleware), independent of US2/US4
- **US4 (P2)**: Depends on US1 (needs auth + admin middleware), independent of US2/US3 (but needs surveys module from spec 006)

### Parallel Opportunities

- All Phase 1 tasks can run in parallel
- All Phase 2 tasks marked [P] can run in parallel
- Within each story: [P]-marked tasks can run in parallel
- US3 and US4 can be built in parallel once US1 is complete

---

## Parallel Example: User Story 1

```bash
# Backend foundation (Phase 2) must complete first
# Then frontend auth tasks can all launch together:
Task: "admin-auth.client.ts"
Task: "useAdmin() hook"
Task: "AdminLoginForm.tsx"
```

## Parallel Example: User Stories 3 & 4

```bash
# Once US1 is done, launch US3 and US4 in parallel:
Task: "User list API + frontend"
Task: "Survey responses API + frontend"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 — login flow
4. Complete Phase 4: US2 — admin shell
5. **STOP and VALIDATE**: Full auth flow works end-to-end
6. Demo/deploy protected admin shell

### Incremental Delivery

1. Setup + Foundational → backend middleware chain works
2. US1 + US2 → admin can log in and see shell (MVP!)
3. US3 → user list added (separate, testable increment)
4. US4 → survey responses added (separate, testable increment)
5. QA + Polish → confidence and edge cases

### Parallel Team Strategy

With multiple developers:
1. Setup + Foundational together
2. Once Foundational done:
   - Developer A: US1 (auth client, login form, login page, middleware)
   - Developer B: US2 (sidebar, layout, dashboard stub) — waits for US1
3. Once US1 is done:
   - Developer A: US3 (user list)
   - Developer B: US4 (survey responses)
