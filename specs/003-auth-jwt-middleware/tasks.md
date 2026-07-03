# Tasks: Express Auth Middleware (JWT Verification)

**Input**: Design documents from `specs/003-auth-jwt-middleware/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No test tasks — manual QA defined in Phase 5.

**Organization**: Tasks grouped by priority. All P1 stories (valid token, missing token, expired/tampered token) share the same `auth.middleware.ts` — implemented in one phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

## Path Conventions

- Backend monorepo: `backend/src/` for source code
- All relative paths from repository root
- Middleware/errors land in `backend/src/shared/` per AGENTS.md
- Repository lands in `backend/src/modules/admins/` per AGENTS.md

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Error classes + env config that every middleware depends on

**⚠️ CRITICAL**: No middleware work can begin until this phase is complete

- [x] T001 [P] Create `UnauthorizedError` class in `backend/src/shared/errors/UnauthorizedError.ts` — extends `Error`, sets `statusCode = 401`, adds `code` property `"UNAUTHORIZED"`
- [x] T002 [P] Create `ForbiddenError` class in `backend/src/shared/errors/ForbiddenError.ts` — extends `Error`, sets `statusCode = 403`, adds `code` property `"FORBIDDEN"`
- [x] T003 [P] Create `config/env.ts` in `backend/src/shared/config/env.ts` — Zod schema validating `SUPABASE_JWT_SECRET` (non-empty string), `DATABASE_URL`, `PORT`. Export typed `env` object. Include barrel export at `backend/src/shared/config/index.ts`
- [x] T004 [P] Create `error-handler.middleware.ts` in `backend/src/shared/middlewares/error-handler.middleware.ts` — Express 4-param `(err, req, res, next)`. If `err.statusCode` exists, respond with that status and `{ error: { code: err.code || "INTERNAL_ERROR", message: err.message } }`. Fallback unknown errors → 500 with generic message. No stack traces in production.

**Checkpoint**: Foundation ready — error classes, config, and error handler exist. T001–T004 all pass before auth middleware begins.

---

## Phase 2: User Story 1+2+3 — Auth Middleware (Priority: P1) 🎯 MVP

**Goal**: `auth.middleware.ts` validates Supabase JWTs locally and populates `req.user`. Handles valid tokens (US1), missing headers (US2), and expired/tampered tokens (US3) — all with 401 responses.

**Independent Test**: `curl -H "Authorization: Bearer <jwt>" http://localhost:3001/api/me` returns `req.user` for valid JWTs, 401 for missing/invalid/expired.

### Implementation for User Stories 1+2+3

- [x] T005 [P] [US1][US2][US3] Create Express type augmentation in `backend/src/shared/middlewares/express.d.ts` — declare module `'express'` adding `user: { id: string; email: string }` to `Request` interface
- [x] T006 [US1][US2][US3] Create `auth.middleware.ts` in `backend/src/shared/middlewares/auth.middleware.ts` — extract `Bearer <token>` from `Authorization` header (missing/malformed → throw `UnauthorizedError`), call `jwt.verify(token, env.SUPABASE_JWT_SECRET)` (invalid/expired → throw `UnauthorizedError`), set `req.user = { id: payload.sub, email: payload.email }`. Include barrel export.
- [x] T007 [US1][US2][US3] Install `jsonwebtoken` + `@types/jsonwebtoken` via pnpm
- [x] T008 [US1][US2][US3] Create stub controller `GET /api/me` in `backend/src/modules/me/me.controller.ts` — returns `{ user: req.user }`. Wire route in `backend/src/app.ts` with `auth.middleware` + `error-handler.middleware`

**Checkpoint**: Auth middleware fully functional. All P1 scenarios testable: valid token → 200 + user, no token → 401, expired/tampered → 401.

---

## Phase 3: User Story 4 — Admin Middleware (Priority: P2)

**Goal**: `admin.middleware.ts` runs after `auth.middleware.ts`, checks `req.user.id` against `admins` table, grants admin routes or returns 403.

**Independent Test**: `curl -H "Authorization: Bearer <user-jwt>" http://localhost:3001/api/admin/ping` returns 403 for non-admin users, 200 for admin users.

### Implementation for User Story 4

- [x] T009 [P] [US4] Create `admins.repository.ts` in `backend/src/modules/admins/admins.repository.ts` — `findByUserId(id: string): Promise<Admin | null>` using `prisma.admin.findUnique({ where: { id } })`. Import prisma singleton from `shared/database/prisma.client.ts`. Include barrel export at `backend/src/modules/admins/index.ts`.
- [x] T010 [US4] Create `admin.middleware.ts` in `backend/src/shared/middlewares/admin.middleware.ts` — check `req.user` exists (throw `UnauthorizedError` if auth middleware didn't run), call `adminsRepo.findByUserId(req.user.id)`, throw `ForbiddenError` if null or `isActive === false`. Include barrel export.
- [x] T011 [US4] Create stub admin route `GET /api/admin/ping` — simple health-check controller. Wire in `backend/src/app.ts` with `auth.middleware` + `admin.middleware` + `error-handler.middleware`

**Checkpoint**: Admin middleware functional. Admin token → 200, non-admin user → 403, no token → 401.

---

## Phase 4: Wiring & Polish

**Purpose**: Ensure error handler is wired globally, no raw `res.status()` in middlewares, cleanup.

- [x] T012 Create `backend/src/app.ts` — Express app setup. Register `error-handler.middleware` as global (last in chain). Mount `GET /api/me` and `GET /api/admin/ping` routes with their middleware chains.
- [x] T013 Create `backend/src/server.ts` — entry point. Import app, call `app.listen(env.PORT || 3001)`. Log startup message.
- [x] T014 Audit: verify no `res.status().json()` calls in middleware files — all errors must go through error handler via `throw`

**Checkpoint**: App boots, all routes wired, error handler is the sole error output path.

---

## Phase 5: Manual QA

**Purpose**: Validate all acceptance criteria end-to-end.

- [x] T015 [US2] Request `GET /api/me` without `Authorization` header → confirm 401 + `UNAUTHORIZED` error code
- [x] T016 [US3] Craft expired JWT (set `exp` to past timestamp, sign with `SUPABASE_JWT_SECRET`), send to `GET /api/me` → confirm 401
- [x] T017 [US3] Tamper a valid JWT (change payload), send to `GET /api/me` → confirm 401
- [x] T018 [US1] Send valid unexpired Supabase JWT to `GET /api/me` → confirm 200 + `user.id` matches JWT `sub`
- [ ] T019 [US4] Send valid user JWT (non-admin) to `GET /api/admin/ping` — requires DB (prisma.admin table) → confirm 403 + `FORBIDDEN` error code
- [ ] T020 [US4] Send valid admin JWT to `GET /api/admin/ping` — requires DB → confirm 200
- [x] T021 Confirm no network calls to Supabase Auth — code review: no supabase-js import in middleware during any of the above (check server logs, no `POST /auth/v1/token` or similar)
- [x] T022 Run `pnpm build` — confirm TypeScript compilation passes passes with no type errors

**Checkpoint**: All acceptance criteria from spec.md verified. Feature ready for PR.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — can start immediately. BLOCKS all other phases.
- **Auth Middleware (Phase 2)**: Depends on Phase 1. BLOCKS Phase 3.
- **Admin Middleware (Phase 3)**: Depends on Phase 2 (auth middleware must exist).
- **Wiring & Polish (Phase 4)**: Depends on Phase 2 and Phase 3.
- **Manual QA (Phase 5)**: Depends on Phase 4.

### User Story Dependencies

- **User Stories 1+2+3 (P1)**: Foundation + auth middleware only — no dependency on admin
- **User Story 4 (P2)**: Auth middleware must be complete before admin middleware can run

### Within Each Phase

- `[P]` tasks can run in parallel (different files, no dependencies)
- Non `[P]` tasks must run sequentially

### Parallel Opportunities

- T001, T002, T003, T004 can all run in parallel
- T005 can run in parallel with T007
- T009 can run in parallel with T010

---

## Implementation Strategy

### MVP First (Phase 2 Only)

1. Complete Phase 1: Foundational
2. Complete Phase 2: Auth Middleware + `GET /api/me` stub
3. **STOP and VALIDATE**: All P1 scenarios work (valid token, missing, expired)
4. Can deploy basic auth-protected endpoints at this point

### Incremental Delivery

1. Phase 1 → Foundation ready
2. Phase 2 → Auth middleware (MVP — P1 stories)
3. Phase 3 → Admin middleware (P2 story — admin-gated routes)
4. Phase 4 → Wiring cleanup
5. Phase 5 → QA sign-off

## Notes

- `[P]` tasks = different files, no dependencies
- `[Story]` label maps task to specific user story for traceability
- Express v5 handles async middleware errors automatically — no `wrapAsync` needed
- All middleware files use `throw` not `res.status().json()` — errors flow through `error-handler.middleware`
- `SUPABASE_JWT_SECRET` comes from Supabase Dashboard > Settings > API > JWT Settings (not the `anon` key)
