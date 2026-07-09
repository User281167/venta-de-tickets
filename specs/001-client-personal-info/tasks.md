---
description: "Implementation tasks for client personal information endpoints"
---

# Tasks: Client Personal Information Endpoints

**Input**: Design documents from `specs/001-client-personal-info/`

**Prerequisites**: spec.md

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`
- **Prisma**: `backend/prisma/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Foundation for all user stories

- [x] T001 Create `backend/src/shared/errors/ValidationError.ts` — custom error class with configurable `code` and `statusCode` fields. Pattern: `code` = `CEDULA_INVALIDATION`, `statusCode` = 422.
- [x] T002 [P] Add `address` and `dateOfBirth` fields to `User` model in `backend/prisma/schema.prisma`:
  - `address String? @map("address") @db.Text`
  - `dateOfBirth DateTime? @map("date_of_birth") @db.Date`
- [x] T003 [P] Add `address` and `dateOfBirth` to `findById` select in `backend/src/modules/users/users.repository.ts`
- [x] T004 Generate Prisma migration: `npx prisma migrate dev --name add_personal_info_fields`
- [x] T005 Export `ValidationError` from `backend/src/shared/errors/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Build `backend/src/modules/me/me.routes.ts` with `Router`, `authMiddleware`, and `requireRole('client')`. Create empty route stubs: `GET /personal-info`, `PUT /personal-info`, `PATCH /personal-info`. Import from controller (created later).
- [x] T007 [P] Create `backend/src/modules/me/me.validators.ts` — Zod schemas for personal info DTO:
  - `personalInfoSchema`: base shape with `cedula` (8-15 digit string), `fullName` (1-150), `phone` (10-20, nullable), `address` (string, nullable), `dateOfBirth` (ISO date string, nullable)
  - `setPersonalInfoSchema`: `.strict()`, requires all fields, `cedula` required
  - `updatePersonalInfoSchema`: `.strict()`, all fields optional, `cedula` explicitly forbidden via `.refine()` — if present throw `CEDULA_INVALIDATION`
- [x] T008 [P] Create `backend/src/modules/me/me.repository.ts`:
  - `findByUserId(userId: string)` — returns personal info fields from `users` table (cedula, fullName, phone, address, dateOfBirth)
  - `upsert(userId: string, data)` — updates the user record with personal info fields
- [x] T009 [P] Create `backend/src/modules/me/me.service.ts`:
  - `getPersonalInfo(userId)` — calls repo, returns DTO with all fields (or nulls if never set)
  - `setPersonalInfo(userId, data)` — checks if `cedula` already set on existing record. If set and different → throw `ValidationError('CEDULA_INVALIDATION', 'Cedula already set and cannot be modified')`. Otherwise upsert.
  - `updatePersonalInfo(userId, data)` — calls set logic (same endpoint handles both initial set and update)
- [x] T010 [P] Expand `backend/src/modules/me/me.controller.ts`:
  - `getPersonalInfoHandler(req, res)` — calls service, returns DTO
  - `setPersonalInfoHandler(req, res)` — parses body with `setPersonalInfoSchema` or `updatePersonalInfoSchema`, calls service, catches `ValidationError` and returns `{ error: { code: 'CEDULA_INVALIDATION', message: '...' } }` with status 422. Also catches Zod errors and returns `{ error: { code: 'VALIDATION_ERROR', message: '...' } }` with status 422.

**Checkpoint**: Foundation ready — `me/` module structure exists with routes, validators, service, repository, controller. All router wiring in place but endpoint logic still untested.

---

## Phase 3: User Story 1 — Client views own personal information (Priority: P1) 🎯 MVP

**Goal**: Authenticated client retrieves their complete personal info DTO.

**Independent Test**: Client calls `GET /api/me/personal-info` with valid JWT. Response contains DTO with all fields populated (or nulls if never set).

- [x] T011 [P] [US1] Implement `findByUserId` in `backend/src/modules/me/me.repository.ts` — select `cedula`, `fullName`, `phone`, `address`, `dateOfBirth` from `users` table by id
- [x] T012 [P] [US1] Implement `getPersonalInfo` in `backend/src/modules/me/me.service.ts` — call repo, return DTO shape `{ cedula, fullName, phone, address, dateOfBirth }`
- [x] T013 [US1] Wire `getPersonalInfoHandler` to `GET /personal-info` route in `backend/src/modules/me/me.routes.ts`
- [x] T014 [US1] Register `meRouter` in `backend/src/app.ts`: `app.use('/api/me', meRouter)` — replace existing inline `app.get('/api/me', authMiddleware, meHandler)` with the new modular routes
- [x] T015 [US1] Delete old `backend/src/modules/me/me.controller.ts` `meHandler` (replaced by new handler)

**Checkpoint**: Client can GET personal info. MVP complete (read-only access).

---

## Phase 4: User Story 2 — Client sets personal information for the first time (Priority: P1)

**Goal**: New client submits personal data including cedula for the first time.

**Independent Test**: Client with null cedula calls `PUT /api/me/personal-info` with valid 8-15 digit cedula + other fields. Subsequent GET returns submitted values.

- [x] T016 [P] [US2] Implement `upsert` in `backend/src/modules/me/me.repository.ts` — `prisma.user.update({ where: { id }, data })` returning personal info fields
- [x] T017 [P] [US2] Implement `setPersonalInfo` in `backend/src/modules/me/me.service.ts`:
  1. Fetch existing user record
  2. If `existing.cedula` is null: allow cedula to be set (first time)
  3. If `existing.cedula` is non-null and `data.cedula` differs: throw `ValidationError('CEDULA_INVALIDATION', 'Cedula already set and cannot be modified')`
  4. Otherwise: upsert with provided data
- [x] T018 [US2] Wire `setPersonalInfoHandler` to `PUT /personal-info` route in `backend/src/modules/me/me.routes.ts`
- [x] T019 [US2] Validate `setPersonalInfoSchema` rejects: cedula < 8 digits, cedula > 15 digits, non-numeric characters, missing required fields

**Checkpoint**: Client can SET initial personal info including cedula. Cedula immutability enforced for subsequent sets.

---

## Phase 5: User Story 3 — Client updates personal information (Priority: P2)

**Goal**: Existing client updates mutable fields (phone, address, fullName, dateOfBirth). Cedula rejected if present in payload.

**Independent Test**: Client with existing profile sends PATCH with new phone + address. Phone and address update. Cedula unchanged.

- [x] T020 [US3] Implement `updatePersonalInfo` in `backend/src/modules/me/me.service.ts`:
  - Accept partial data (only provided fields update)
  - If `cedula` present in payload → throw `ValidationError('CEDULA_INVALIDATION', 'Cedula cannot be modified')`
  - Otherwise upsert with provided fields
- [x] T021 [US3] Wire `setPersonalInfoHandler` (reused, detects set vs update from body presence) to `PATCH /personal-info` route in `backend/src/modules/me/me.routes.ts`
- [x] T022 [US3] Validate in controller: Zod parse body with `updatePersonalInfoSchema` (cedula forbidden via refine). On violation → return `{ error: { code: 'CEDULA_INVALIDATION', message: 'Cedula cannot be modified' } }` status 422.

**Checkpoint**: Full CRUD for personal info. Cedula protected. All error codes consistent.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, cleanup, hardening

- [x] T023 [P] Create `backend/src/modules/me/README.md` documenting:
  - Module purpose (client personal info management)
  - Route table: `GET /api/me/personal-info`, `PUT /api/me/personal-info`, `PATCH /api/me/personal-info`
  - Request/response shapes for each route
  - Error codes table: `CEDULA_INVALIDATION` (422), `VALIDATION_ERROR` (422), `FORBIDDEN` (403), `UNAUTHORIZED` (401)
  - Mermaid sequence diagram showing SET flow: Client → PUT → Controller → Validator → Service → CedulaCheck → Repository → DB → Response
- [x] T024 [P] Update `backend/src/app.ts`: remove old inline `app.get('/api/me', authMiddleware, meHandler)` — now handled by modular `meRouter`
- [x] T025 Add `requireRole('client')` to `backend/src/modules/me/me.routes.ts` after `authMiddleware` but before personal-info routes
- [x] T026 Verify error response consistency: all endpoints return `{ error: { code: string, message: string } }` matching existing `error-handler.middleware.ts` pattern

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — GET endpoint
- **US2 (Phase 4)**: Depends on Foundational + US1 (GET helps verify SET worked)
- **US3 (Phase 5)**: Depends on Foundational + US2 (update requires existing profile)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no dependencies on other stories
- **US2 (P1)**: Can start after Foundational — independent from US1
- **US3 (P2)**: Can start after Foundational — needs US2 for initial data

### Within Each User Story

- Validators before service
- Repository before service
- Service before controller
- Controller before routes

### Parallel Opportunities

- T002, T003: Both modify Prisma schema files — can run in parallel
- T007, T008, T009, T010: All are independent new files — fully parallel
- T011, T012: Repository + service for US1 — parallel
- T016, T017: Repository + service for US2 — parallel
- T023, T024: Documentation + cleanup — parallel

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (ValidationError + schema migration)
2. Complete Phase 2: Foundational (me/ module structure)
3. Complete Phase 3: US1 (GET endpoint)
4. **STOP and VALIDATE**: Test GET endpoint independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Module structure ready
2. Add US1 → GET personal info → Deploy (MVP!)
3. Add US2 → SET personal info with cedula → Deploy
4. Add US3 → UPDATE personal info → Deploy
5. Add Polish → README + cleanup → Deploy

---

## Parallel Execution Example: User Story 1

```bash
# Launch repository + service together:
Task: "Implement findByUserId in me.repository.ts"
Task: "Implement getPersonalInfo in me.service.ts"

# Then controller + route (depend on repo + service):
Task: "Wire getPersonalInfoHandler in me.controller.ts"
Task: "Wire GET route in me.routes.ts"
```
