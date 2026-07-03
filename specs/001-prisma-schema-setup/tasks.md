# Tasks: Prisma Schema & Database Setup

**Input**: Design documents from `specs/001-prisma-schema-setup/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: No explicit test tasks — validation is via `prisma validate` and `prisma migrate dev`.

**Organization**: Tasks grouped by build order (FK dependency graph). Schema is single file — tasks within each phase are sequential within file.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

## Path Conventions

- Backend monorepo: `backend/prisma/schema.prisma`, `backend/src/shared/database/prisma.client.ts`
- `.env` at `backend/.env`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install Prisma, configure connection strings, resolve open questions

- [x] T001 Install `prisma` and `@prisma/client` in `backend/` via pnpm
- [x] T002 Run `prisma init --datasource-provider postgresql` in `backend/` to create `prisma/schema.prisma` and `.env`
- [x] T003 Configure `DATABASE_URL` (pooled, port 6543, `?pgbouncer=true&connection_limit=1`) and `DIRECT_URL` (direct, port 5432) in `backend/.env` from Supabase credentials
- [x] T004 Resolve open question: soft-delete on events — decision in research.md: no soft-delete (status field sufficient)
- [x] T005 Resolve open question: tickets vs event_guests relationship — decision in research.md: separate entities, tickets FK to users, not guests

---

## Phase 2: User Story 1 — Schema Validation and Migration (Priority: P1) 🎯 MVP

**Goal**: Complete validated Prisma schema with all 12 entities, enums, relations, and constraints. Migration runs successfully against Supabase.

**Independent Test**: `prisma validate` returns zero errors; `prisma migrate dev --name init` creates all tables.

### Core Identity Models

- [x] T006 [US1] Define enums (`AdminRole`, `PolicyType`) at top of `backend/prisma/schema.prisma`
- [x] T007 [US1] Define `users` model with UUID PK, fields (fullName, email unique, phone?, passwordHash, isActive), timestamps in `backend/prisma/schema.prisma`
- [x] T008 [US1] Define `admins` model with UUID PK, fields (fullName, email unique, passwordHash, role AdminRole, isActive), timestamps in `backend/prisma/schema.prisma`
- [x] T009 [US1] Define `privacy_acceptances` model with UUID PK, FK to users, fields (policyVersion, policyType PolicyType, acceptedAt, ipAddress @db.Inet, userAgent) in `backend/prisma/schema.prisma`

### Venues & Events Models

- [x] T010 [US1] Define `venues` model with UUID PK, fields (name, address, city, capacity?), timestamps in `backend/prisma/schema.prisma`
- [x] T011 [US1] Define `EventStatus` enum and `events` model with UUID PK, FKs to venues and admins, fields (title, description?, eventDate, doorsOpenAt?, saleStartsAt?, saleEndsAt?, status EventStatus), timestamps in `backend/prisma/schema.prisma`
- [x] T012 [US1] Define `event_images` model with UUID PK, FK to events, fields (url, alt?, isPrimary, sortOrder), createdAt in `backend/prisma/schema.prisma`

### Ticketing Models

- [x] T013 [US1] Define `ticket_types` model with UUID PK, FK to events, fields (name, description?, price Decimal, quantityTotal, quantitySold, maxPerUser?, saleStartsAt?, saleEndsAt?, isActive), timestamps in `backend/prisma/schema.prisma`
- [x] T014 [US1] Define `DiscountType` enum and `discount_codes` model with UUID PK, FK to events, fields (code unique, discountType DiscountType, discountValue Decimal, maxUses?, usedCount, validUntil?, isActive), createdAt in `backend/prisma/schema.prisma`
- [x] T015 [US1] Define `GuestStatus` enum and `event_guests` model with UUID PK, FKs to events and users (optional), fields (fullName, email?, status GuestStatus, invitedAt, respondedAt?) in `backend/prisma/schema.prisma`
- [x] T016 [US1] Define `TicketStatus` enum and `tickets` model with UUID PK, FKs to ticket_types, events, users, discount_codes (optional), admins (checked_in_by, optional), fields (discountApplied?, ticketCode unique, status TicketStatus, reserveExpiresAt?, purchasedAt?, cancelledAt?, checkedInAt?), createdAt, indexes on eventId/userId/ticketTypeId/status in `backend/prisma/schema.prisma`

### Payments & Survey Models

- [x] T017 [US1] Define `PaymentStatus` enum and `payments` model with UUID PK, FKs to tickets and users, fields (amount Decimal, currency default COP, paymentMethod, gatewayReference, status PaymentStatus, paidAt?), createdAt in `backend/prisma/schema.prisma`
- [x] T018 [US1] Define `survey_responses` model with UUID PK, FKs to events and users (optional), fields (responses @db.JsonB), submittedAt in `backend/prisma/schema.prisma`

### Validation & Migration

- [x] T019 [US1] Run `prisma validate` on `backend/prisma/schema.prisma` — confirm zero errors
- [x] T020 [US1] Run `prisma migrate dev --name init` against Supabase — confirm all 12 tables created with correct columns and constraints

---

## Phase 3: User Story 2 — Prisma Client Singleton (Priority: P1)

**Goal**: Single reusable Prisma Client instance connected to Supabase.

**Independent Test**: Import client from `src/shared/database/prisma.client.ts`, execute `prisma.user.findMany()` — no connection/schema errors.

- [x] T021 [P] [US2] Create `backend/src/shared/database/` directory structure
- [x] T022 [US2] Create Prisma Client singleton in `backend/src/shared/database/prisma.client.ts` — instantiate once in global scope, export as default
- [ ] T023 [US2] Smoke test: import client, run `findMany()` on each of 12 models — confirm no connection errors

---

## Phase 4: User Story 3 — Enum Definitions (Priority: P2)

**Note**: Enums already defined inline during Phase 2 (T006, T010, T013, T014, T015, T016, T017). This phase verifies completeness.

- [x] T024 [P] [US3] Audit `backend/prisma/schema.prisma` — confirm all status/role/type fields reference enums, no free-text String used
- [x] T025 [US3] Run `prisma validate` — confirm type safety across all enum references

---

## Phase 5: User Story 4 — Relation Integrity (Priority: P2)

**Note**: Relations already defined during Phase 2. This phase verifies correctness.

- [x] T026 [US4] Audit `backend/prisma/schema.prisma` — confirm all 12 FK relations defined (users → privacy_acceptances, venues → events, events → ticket_types/discount_codes/event_images/event_guests/survey_responses/tickets, ticket_types → tickets, users → tickets/payments/event_guests/survey_responses, admins → events/tickets, tickets → payments, discount_codes → tickets)
- [x] T027 [US4] Verify each relation has correct cardinality (one-to-many, optional/required) matching data-model.md

---

## Phase 6: Acceptance Check (Polish & Cross-Cutting)

**Purpose**: Verify all acceptance criteria from spec.md are met; confirm no out-of-scope code introduced.

- [x] T028 Verify all spec acceptance criteria: schema validates, migration runs, client singleton works, enums used everywhere, no repository/service code introduced
- [x] T029 Scan `backend/src/` for any repository, service, controller, or route files — confirm none exist (out of scope check)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1 — Schema (Phase 2)**: Depends on Setup completion
- **US2 — Client (Phase 3)**: Depends on Phase 2 (schema must exist for prisma generate)
- **US3 — Enums (Phase 4)**: Depends on Phase 2 (audit only, no implementation)
- **US4 — Relations (Phase 5)**: Depends on Phase 2 (audit only, no implementation)
- **Acceptance (Phase 6)**: Depends on all prior phases

### Task Dependencies Within Phases

- **Phase 2 (Schema)**: Sequential — each model builds on previous (T006→T018). FK references require prior model definitions. Exception: T007 users and T008 admins can be parallel.
- **Phase 3 (Client)**: T021 can run in parallel with end of Phase 2 (ready once schema compiles). T022 depends on T021; T023 depends on T022.
- **Phase 4 & 5**: Pure verification — can run after T019 (prisma validate).

### Parallel Opportunities

- T007 [US1] (users) and T008 [US1] (admins) — parallel, no FK dependency between them
- T021 [P] [US2] (create directory) — can start as soon as Phase 2 validation begins (T019)
- T024 [P] [US3] (enum audit) — can run independently alongside other verification
- All audit-only tasks (T024-T029) — can run in parallel once schema compiles

---

## Parallel Example: Phase 2 (Schema Models)

```bash
# Core identity — users and admins in parallel:
Task: "Define users model in backend/prisma/schema.prisma"
Task: "Define admins model in backend/prisma/schema.prisma"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Schema (T006-T020)
3. **STOP and VALIDATE**: `prisma validate` + `prisma migrate dev`
4. Deploy/demo with schema foundation

### Incremental Delivery

1. Setup + Schema → Foundation ready (MVP!)
2. Add Client Singleton → US2 complete
3. Verify Enums + Relations → US3 + US4 complete
4. Acceptance Check → feature ships
