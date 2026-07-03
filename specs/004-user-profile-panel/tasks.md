# Tasks: User Profile Panel (Personal Data & Privacy Consent)

**Input**: Design documents from `specs/004-user-profile-panel/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: No explicit test tasks — manual QA defined in Phase 6.

**Organization**: Tasks grouped by layer (backend foundation → backend routes → frontend data → frontend UI → QA). Sequential dependency chain.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

## Path Conventions

- Backend: `backend/src/`
- Frontend: `frontend/src/`
- Backend users module: `backend/src/modules/users/`
- Frontend features: `frontend/src/features/users/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No setup tasks — project structure, dependencies, and auth middleware already exist from prior features.

**Checkpoint**: Ready for backend foundation.

---

## Phase 2: Backend Foundation (T0)

**Purpose**: Zod validators, Prisma repository, and `policyVersion` constant — foundational building blocks for all user stories.

**⚠️ CRITICAL**: All backend route work depends on this phase.

- [x] T001 [US1][US2] Create `users.validators.ts` in `backend/src/modules/users/users.validators.ts` — Zod `updateUserSchema` with allowlist (fullName: z.string().min(1).max(150), phone: z.string().min(10).max(20).optional().nullable()). Strip `email` and `id` with a transformer. Include barrel export at `backend/src/modules/users/index.ts`.
- [x] T002 [US1][US2][US3] Create `users.repository.ts` in `backend/src/modules/users/users.repository.ts` — `findById(id)` returning user row, `update(id, data)` for allowed fields, `createPrivacyAcceptance(userId, policyVersion, ipAddress, userAgent)` inserting into `privacy_acceptances`. Import Prisma singleton from `shared/database/prisma.client.ts`.
- [x] T003 [US3] Add `PRIVACY_POLICY_VERSION = '1.0.0'` and `PRIVACY_POLICY_TYPE = 'privacy_policy'` constants in `backend/src/shared/config/constants.ts`. Create file if not exists.

**Checkpoint**: Backend foundation ready — validators, repository, and constants exist.

---

## Phase 3: Backend Service & Routes (T1)

**Goal**: Service layer, Express controller, and routes for all profile endpoints. Protected by `auth.middleware` from 003-express-auth-middleware.

- [x] T004 [US1][US2][US3] Create `users.service.ts` in `backend/src/modules/users/users.service.ts` — `getMe(id)` returns user + consentStatus, `updateMe(id, data)` applies allowlist (strips email/id, rejects unknown), `acceptPrivacy(id, ipAddress, userAgent)` records consent (idempotent — returns existing if already accepted). Import validators and repository.
- [x] T005 [US1][US2][US3] Create `users.controller.ts` in `backend/src/modules/users/users.controller.ts` — `GET /me` handler calls `usersService.getMe(req.user!.id)`, `PATCH /me` calls `usersService.updateMe(req.user!.id, req.body)`, `POST /me/privacy-acceptance` captures `ip` from `req.ip` and `user-agent` from header then calls `usersService.acceptPrivacy(...)`.
- [x] T006 [P] Create `users.routes.ts` in `backend/src/modules/users/users.routes.ts` — Express Router with `authMiddleware` on all routes, mounts GET `/me`, PATCH `/me`, POST `/me/privacy-acceptance`. Export router.
- [x] T007 Wire `users.routes.ts` into `backend/src/app.ts` — import `usersRouter`, mount at `/api/users`. Add `app.set('trust proxy', 1)` for correct `req.ip` behind Railway proxy.

**Checkpoint**: All backend endpoints functional. Testable via curl/Postman: `GET /api/users/me`, `PATCH /api/users/me`, `POST /api/users/me/privacy-acceptance`.

---

## Phase 4: Frontend Data Layer (T2)

**Goal**: Frontend Zod schema, fetch wrappers, and TanStack Query hooks for profile data.

**Note**: All frontend queries depend on backend Phase 3 being complete.

- [x] T008 [US1][US2] Create `users.schema.ts` in `frontend/src/features/users/schemas/users.schema.ts` — Zod schema mirroring backend `updateUserSchema` (fullName string, phone nullable string). Include type inference export.
- [x] T009 [P] Create `users.endpoints.ts` in `frontend/src/features/users/api/users.endpoints.ts` — `fetchMe()`, `updateMe(data)`, `acceptPrivacy()` calling `/api/users/me*`. Use same fetch client pattern as existing features.
- [x] T010 [US1][US2][US3] Create `users.queries.ts` in `frontend/src/features/users/api/users.queries.ts` — TanStack Query hooks: `useMe()` (queryKey `['me']`, returns user + consentStatus), `useUpdateMe()` (mutation, invalidates `['me']`), `useAcceptPrivacy()` (mutation, invalidates `['me']`).

**Checkpoint**: Frontend data layer ready — any component can use `useMe()`, `useUpdateMe()`, `useAcceptPrivacy()`.

---

## Phase 5: Frontend UI (T3)

**Goal**: User-visible components: consent modal, profile form, and page composition.

- [x] T011 [US3] Create `PrivacyConsentModal.tsx` in `frontend/src/features/users/components/PrivacyConsentModal.tsx` — blocking modal rendering only when `consentStatus.required === true && !consentStatus.acceptedAt`. Displays privacy policy text, checkbox, and accept button. Calls `useAcceptPrivacy()` on submit. Prevents closing/dismissing without accepting.
- [x] T012 [US1][US2][US4] Create `ProfileForm.tsx` in `frontend/src/features/users/components/ProfileForm.tsx` — displays user data in read-only mode with "Edit" toggle. Edit mode shows editable fields (fullName, phone) with Zod validation. Save calls `useUpdateMe()`. Cancel discards changes. Shows consent status (accepted date + version) from `useMe()`.
- [x] T013 [US1][US2][US3][US4] Create `page.tsx` in `frontend/src/app/mi-cuenta/page.tsx` — checks auth (redirect to login if 401), calls `useMe()`, renders `PrivacyConsentModal` if consent pending, otherwise renders `ProfileForm`.

**Checkpoint**: Full UI functional at `/mi-cuenta`.

---

## Phase 6: Manual QA (T4)

**Purpose**: Verify all acceptance criteria from spec.md end-to-end.

- [ ] T014 [US1] Visit `/mi-cuenta` as authenticated user with complete profile — confirm all fields display correctly.
- [ ] T015 [US2] Edit `fullName` and `phone`, save, reload page — confirm values persisted. Attempt to set `email` or `id` — confirm rejected with error.
- [ ] T016 [US3] As user without privacy acceptance record, visit `/mi-cuenta` — confirm blocking modal appears. Accept — confirm modal closes and profile visible.
- [ ] T017 [US3][US4] As user who already accepted current policy version, visit `/mi-cuenta` — confirm panel loads directly (no modal). Consent status shows accepted date.
- [ ] T018 [US1][US2][US3] Call any `/api/users/me*` endpoint without `Authorization` header — confirm 401 response.

**Checkpoint**: All acceptance criteria verified. Feature ready for PR.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — already complete
- **Backend Foundation (Phase 2)**: No dependencies — can start immediately. BLOCKS Phase 3.
- **Backend Routes (Phase 3)**: Depends on Phase 2. BLOCKS Phase 4.
- **Frontend Data Layer (Phase 4)**: Depends on Phase 3 (API must exist). BLOCKS Phase 5.
- **Frontend UI (Phase 5)**: Depends on Phase 4. BLOCKS Phase 6.
- **Manual QA (Phase 6)**: Depends on Phase 5.

### User Story Dependencies

- **US1 (View Profile)**: T001 → T002 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T012 → T013
- **US2 (Edit Profile)**: Same chain as US1 (same backend/frontend files)
- **US3 (Privacy Consent)**: T001 → T002 → T003 → T004 → T005 → T006 → T007 → T010 → T011 → T013
- **US4 (Review Consent Status)**: US1 chain + T012 (consent status display)

### Within Each Phase

- `[P]` tasks can run in parallel (different files, no dependencies)
- Non `[P]` tasks must run sequentially

### Parallel Opportunities

- T006 (routes.ts) can run in parallel with T004 (service.ts) and T005 (controller.ts) — different files, routes depends on controller existing but can be drafted concurrently
- T009 (endpoints) can run in parallel with T008 (schema) — independent files

---

## Implementation Strategy

### MVP First (Phase 2 + 3 Only)

1. Complete Phase 2: Backend Foundation
2. Complete Phase 3: Backend Routes
3. **STOP and VALIDATE**: All three endpoints work via curl/Postman
4. Frontend can be built incrementally

### Incremental Delivery

1. Phase 2 → Foundation ready
2. Phase 3 → Backend API ready
3. Phase 4 → Frontend data layer ready (headless — no UI yet)
4. Phase 5 → UI visible
5. Phase 6 → QA sign-off

---

## Notes

- `[P]` tasks = different files, no dependencies
- `[Story]` label maps task to specific user story for traceability
- All backend endpoints protected by `auth.middleware.ts` — no separate auth logic needed
- `req.user` type augmentation already exists from 003-express-auth-middleware
- `ipAddress` captured server-side via `req.ip` with `trust proxy` — never from client payload
- `policyVersion` is a server constant (`PRIVACY_POLICY_VERSION = '1.0.0'`) — not configurable at runtime for v1
- Editable fields allowlist: `fullName`, `phone` — `email`/`id` rejected with error
- Privacy acceptance is idempotent: duplicate calls return existing record, not a new one
