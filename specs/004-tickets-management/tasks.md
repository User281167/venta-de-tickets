# Tasks: Tickets Management

**Input**: Design documents from `specs/004-tickets-management/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Unit tests required per user request — test each if condition, success path, error code for every endpoint.

**Organization**: Tasks grouped by dependency order. Schema/migration first, then module creation, then endpoints, then tests, then cleanup.

## Path Conventions

- Backend: `backend/src/modules/tickets/`
- Tests: `backend/tests/unit/tickets/`, `backend/tests/integration/tickets/`
- Shared: `backend/src/shared/`

---

## Phase 1: Setup & Schema Migration

**Purpose**: Prisma schema update, old module removal, module directory creation

- [X] T001 Add `TicketTypeStatus` enum to `backend/prisma/schema.prisma` (values: enabled, disabled, blocked)
- [X] T002 Replace `isActive Boolean @default(true)` with `status TicketTypeStatus @default(enabled)` in TicketType model at `backend/prisma/schema.prisma`
- [ ] ~~T003 Generate Prisma migration from `backend/`: `npx prisma migrate dev --name add_ticket_status_enum`~~ *(skipped per user request — run manually)*
- [ ] ~~T004 Verify migration SQL correctly maps `isActive=true` → `'enabled'`, `isActive=false` → `'disabled'`~~ *(skipped per user request — verify migration SQL manually)*
- [X] T005 Delete `backend/src/modules/ticket-types/` directory entirely
- [X] T006 Remove all `ticket-types` route registrations from `backend/src/app.ts`
- [X] T007 Create `backend/src/modules/tickets/` directory with files: index.ts, tickets.routes.ts, tickets.controller.ts, tickets.service.ts, tickets.repository.ts, tickets.validators.ts, tickets.types.ts, tickets.config.ts

**Checkpoint**: Schema migrated, old module gone, new module skeleton ready.

---

## Phase 2: Types, DTOs & Config (Foundational)

**Purpose**: Shared types, response DTOs, module config that all endpoints depend on

- [ ] T008 [P] Create `backend/src/modules/tickets/tickets.types.ts` — define TicketTypeDTO (response shape), PaginatedResponse<T>, CreateTicketInput, UpdateTicketInput, StatusChangeInput
- [ ] T009 [P] Create `backend/src/modules/tickets/tickets.config.ts` — module constants: DEFAULT_PAGE_LIMIT=20, MAX_PAGE_LIMIT=100
- [ ] T010 [P] Create `backend/src/modules/tickets/tickets.validators.ts` — Zod schemas: createTicketSchema, updateTicketSchema, statusSchema, paginationSchema, paramsSchema (uuid id)
- [ ] T011 [P] Create `backend/src/modules/tickets/index.ts` — barrel re-exporting ticketsRouter (public + admin), types

**Checkpoint**: Types, validators, config ready for endpoint implementation.

---

## Phase 3: US2 — Public Read Endpoints (Priority: P1)

**Goal**: Anyone can list ticket types (paginated, excludes blocked) and get one by ID.

**Story**: [US2]

**Independent Test**: Unauthenticated request to `GET /api/tickets` returns paginated list. `GET /api/tickets/:id` returns single ticket. Blocked tickets excluded from list but retrievable by ID.

- [ ] T012 [P] [US2] Create `backend/src/modules/tickets/tickets.repository.ts` — Prisma queries: findAll (paginated, filter by status != blocked), findById, create, update, count (filtered)
- [ ] T013 [P] [US2] Create `backend/src/modules/tickets/tickets.service.ts` — listTicketTypes (page, limit → paginated response, filters blocked), getTicketTypeById (throws NotFoundError if missing)
- [ ] T014 [US2] Create `backend/src/modules/tickets/tickets.controller.ts` — list (parses query, calls service, returns JSON), getById (parses params, calls service, returns JSON), handle validation errors with 422
- [ ] T015 [US2] Create `backend/src/modules/tickets/tickets.routes.ts` — public routes: GET / => list, GET /:id => getById. No auth middleware.
- [ ] T016 [US2] Register `ticketsRouter` in `backend/src/app.ts`: `app.use('/api/tickets', ticketsRouter)`

**Checkpoint**: GET /api/tickets and GET /api/tickets/:id work without authentication. Blocked tickets excluded from list.

---

## Phase 4: US1 — Admin Mutation Endpoints (Priority: P1)

**Goal**: Admin can create, update ticket type fields, and change status (enable/disable/block) via PATCH. Status change merged into PATCH /api/admin/tickets/:id.

**Story**: [US1]

**Independent Test**: Authenticated admin creates ticket type (POST), modifies fields + status (PATCH). Non-admin gets 403. Validation errors for price <= 0, quantity <= 0, quantity < sold.

- [ ] T017 [P] [US1] Add to `backend/src/modules/tickets/tickets.service.ts` — createTicketType (validates + creates with status=enabled), updateTicketType (validates quantity >= sold, updates fields + status), validateQuantityNotBelowSold helper
- [ ] T018 [P] [US1] Add to `backend/src/modules/tickets/tickets.controller.ts` — create (201 + created object), update (200 + updated object), handle errors with proper status codes (422 validation, 403 forbidden, 404 not found)
- [ ] T019 [US1] Add admin routes to `backend/src/modules/tickets/tickets.routes.ts` — adminTicketRouter with authMiddleware + adminMiddleware: POST / => create, PATCH /:id => update
- [ ] T020 [US1] Register `adminTicketsRouter` in `backend/src/app.ts`: `app.use('/api/admin/tickets', adminTicketsRouter)`

**Checkpoint**: Admin CRUD fully functional. Create validates price/quantity. PATCH validates quantity >= sold. Status changes merged into PATCH.

---

## Phase 5: US4 — Admin List with Blocked (Priority: P2)

**Goal**: Admin listing includes blocked tickets for management visibility.

**Story**: [US4]

**Independent Test**: Authenticated admin calls admin list endpoint and sees blocked ticket types included.

- [ ] T021 [US4] Add admin-only list to `backend/src/modules/tickets/tickets.service.ts` — listAllTicketTypes (no status filter, paginated)
- [ ] T022 [US4] Add admin list handler to `backend/src/modules/tickets/tickets.controller.ts` — adminList (returns all statuses)
- [ ] T023 [US4] Add admin list route to adminTicketRouter in `tickets.routes.ts`: GET / => adminList

**Checkpoint**: Admin list returns all statuses. Public list still filters blocked.

---

## Phase 6: Tests (Unit + Integration)

**Purpose**: Unit tests for every if condition, success path, and error code. Mock data. Do not fix or modify existing tests from other modules.

- [ ] T024 [P] Create `backend/tests/unit/tickets/tickets.validators.test.ts` — test Zod schemas: valid create input passes, price <= 0 fails, quantity <= 0 fails, empty name fails, valid update with partial fields passes, invalid status fails, pagination with negative page fails
- [ ] T025 [P] Create `backend/tests/unit/tickets/tickets.service.test.ts` — test service: createTicketType success, createTicketType validation delegation, getTicketTypeById returns ticket, getTicketTypeById throws NotFound, listTicketTypes filters blocked, listTicketTypes pagination, updateTicketType quantity >= sold passes, updateTicketType quantity < sold throws
- [ ] T026 [P] Create `backend/tests/unit/tickets/tickets.controller.test.ts` — test controller: list returns 200 with data, getById returns 200, getById missing returns 404, create returns 201, create validation error returns 422, update returns 200, update quantity < sold returns 422
- [ ] T027 [P] Create `backend/tests/integration/tickets/tickets.api.test.ts` — test endpoints via supertest: unauthenticated list returns 200, unauthenticated get by ID returns 200, unauthenticated create returns 403, admin create returns 201, admin update returns 200, admin update quantity < sold returns 422, admin set status via PATCH returns 200

**Checkpoint**: All endpoint scenarios tested. All if conditions covered. All error codes verified.

---

## Phase 7: Polish — README & Cleanup

**Purpose**: Module documentation, remove dead code from old ticket-types module.

- [ ] T028 Create `backend/src/modules/tickets/README.md` — short description, list of endpoints with methods/paths, all return codes (200, 201, 404, 422, 403, 500), sequence diagram for create flow and list flow, example error responses
- [ ] T029 Remove dead code: delete any remaining references to old `ticket-types` in app.ts, delete old `ticket-types` test files if they exist
- [ ] T030 Run `npx vitest run` from `backend/` — verify all tests pass, fix ONLY tickets tests if broken (do not touch other module tests)
- [ ] T031 Run `npm run dev` from `backend/` — verify server starts without errors, manual smoke test with curl

**Checkpoint**: Documentation complete, dead code removed, tests pass, server starts.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Types)**: Depends on Phase 1 (module skeleton) — BLOCKS all other phases
- **Phase 3 (US2 public)**: Depends on Phase 2 — no dependency on Phase 4
- **Phase 4 (US1 admin)**: Depends on Phase 2 — no dependency on Phase 3
- **Phase 5 (US4 admin list)**: Depends on Phase 4 (uses admin routes)
- **Phase 6 (Tests)**: Depends on Phase 3 + Phase 4 (endpoints must exist)
- **Phase 7 (Polish)**: Depends on Phase 6 (tests must pass)

### User Story Dependencies

- **US2 (Public Read — P1)**: Can start after Phase 2. No dependency on US1.
- **US1 (Admin CRUD — P1)**: Can start after Phase 2. Independent of US2.
- **US4 (Admin List All — P2)**: Uses same admin routes as US1, start after US1.
- **US3 (Non-admin Auth — P2)**: Automatically covered by auth middleware — no separate tasks needed.

### Parallel Opportunities

- T007-T010 (Phase 2 types/validators/config): All [P], run in parallel
- T012-T013 (Phase 3 repository/service): [P], run in parallel
- T017-T018 (Phase 4 service/controller): [P], run in parallel
- T024-T027 (Phase 6 tests): All [P], run in parallel
- Phase 3 (US2) and Phase 4 (US1) can run in parallel after Phase 2

---

## Implementation Strategy

### MVP First (Phase 3 + Phase 4 in parallel)

1. Complete Phase 1: Schema migration + old module removal
2. Complete Phase 2: Types, validators, config
3. Run Phase 3 (US2) + Phase 4 (US1) in parallel:
   - One developer: public list + get by ID endpoints
   - Another developer: admin create + update endpoints
4. **STOP and VALIDATE**: Manual smoke test with curl
5. Run Phase 5: Admin all-status list
6. Run Phase 6: Tests
7. Run Phase 7: README + cleanup

### Incremental Delivery

1. Schema + types → foundation ready
2. Public endpoints (US2) → anyone can browse tickets → deploy/demo!
3. Admin endpoints (US1) → admin can manage tickets
4. Tests + docs → quality gate
5. Cleanup → done

---

## Parallel Example: Phase 3 + Phase 4

```bash
# Phase 3 (US2): Public read endpoints
Task: "Create tickets.repository.ts with findAll/findById"
Task: "Create tickets.service.ts with list/getById"
Task: "Create tickets.controller.ts with list/getById handlers"
Task: "Create tickets.routes.ts with public routes"
Task: "Register in app.ts"

# Phase 4 (US1): Admin mutation endpoints (parallel after Phase 3 done)
Task: "Add createTicketType/updateTicketType to service"
Task: "Add create/update handlers to controller"
Task: "Add admin routes with auth+admin middleware"
Task: "Register admin routes in app.ts"
```

## Notes

- [P] tasks = different files, no dependencies — safe for parallel execution
- Status changes merged into PATCH /api/admin/tickets/:id (no separate /status endpoint)
- Use existing `NotFoundError`, `ValidationError`, `ForbiddenError` from `shared/errors/`
- Use existing `authMiddleware`, `adminMiddleware` from `shared/middlewares/`
- Validation style: `.parse()` with try/catch per admins module pattern
- Response shape: `{ data, total, page, limit }` per admins module pattern
- Do NOT modify tests from other modules (users, admins, me, etc.)
