# Tasks: Ticketing

**Input**: Design documents from `specs/008-ticketing/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No test tasks included — spec did not request TDD.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Include exact file paths

## Paths

- **Backend**: `backend/src/`
- **Frontend**: `frontend/src/`
- **Shared**: `backend/src/shared/`

---

## Phase 1: Setup (Schema, Migration, Seed, Config)

**Purpose**: Database schema modifications, migration with sequence, env config, seed data

**No blockers — can start immediately**

- [x] T001 Modify `Event` model in `backend/prisma/schema.prisma` — add fields `description`, `location`, `prefix`, keep existing `title`/`eventDate`/`status`/`doorsOpenAt`/`saleEndsAt`
- [x] T002 [P] Modify `TicketType` model in `backend/prisma/schema.prisma` — ensure `quantityTotal`, `quantitySold`, `maxPerUser`, `saleEndsAt`, `isActive` fields present (already matches spec)
- [x] T003 [P] Add `confirmed` value to `TicketStatus` enum in `backend/prisma/schema.prisma` — final enum: `reserved`, `active`, `used`, `cancelled`, `expired`, `confirmed`
- [x] T004 [P] Modify `Ticket` model in `backend/prisma/schema.prisma` — add `qrToken` field (`String? @unique @map("qr_token") @db.Text`)
- [x] T005 Run `npx prisma validate` to confirm schema is valid
- [x] T006 Run `npx prisma migrate dev --name ticketing_schema` — generates migration SQL (manual migration created)
- [x] T007 Manually add `CREATE SEQUENCE IF NOT EXISTS ticket_seq START 1;` to the generated migration SQL file
- [x] T008 Run `npx prisma migrate deploy` and confirm clean apply
- [x] T009 Add `QR_JWT_SECRET` validation to `backend/src/shared/config/env.ts` — required, min length 32
- [x] T010 Add `QR_JWT_SECRET` to `.env` file
- [x] T011 Add `RESERVATION_TTL_MINUTES = 10` and `MAX_TICKETS_PER_USER = 4` to `backend/src/shared/config/constants.ts`
- [x] T012 Extend `backend/prisma/seed.ts` — upsert event record (Future Minds 2026, prefix `FM26`, status `published`) by name, idempotent
- [x] T013 Insert 3 initial ticket types (General, Premium, VIP) linked to seeded event if none exist — idempotent
- [x] T014 Run `npx prisma db seed` and confirm records in Supabase
- [x] T015 Confirm tables `events`, `ticket_types`, `tickets` exist via Prisma Studio or Supabase
- [x] T016 Confirm `ticket_seq` sequence exists in Postgres
- [x] T017 Confirm seed data correct — 1 event + 3 ticket types
- [x] T018 Create `backend/src/modules/ticket-types/` module skeleton with index.ts barrel export and `ticket-types.types.ts`

**Checkpoint**: Schema ready, database migrated, seed data loaded, ticket-types module scaffolded

---

## Phase 2: User Story 1 — Public Event Browsing (Priority: P1) MVP

**Goal**: Visitor sees event details + live ticket type availability without auth

**Independent Test**: Load event page in anonymous browser — verify event details render, ticket types list with availability counts, sold-out types show "Agotado"

### Backend

- [ ] T019 [US1] Create `ticket-types.repository.ts` — `findAllActive(eventId)` returning ticket types with `availableCount = quantityTotal - quantitySold`, filter `isActive = true`
- [ ] T020 [US1] Create `ticket-types.service.ts` — `getEventWithAvailability(eventId)` fetches event + active ticket types from repository
- [ ] T021 [US1] Create `ticket-types.controller.ts` — `GET /api/events/:eventId` handler returning event details + ticket types with availability
- [ ] T022 [US1] Create `ticket-types.validators.ts` — Zod schema for event ID param validation
- [ ] T023 [US1] Create `ticket-types.routes.ts` — mount `GET /:eventId` on public router (no auth middleware)

### Frontend

- [ ] T024 [US1] Create `frontend/src/app/(public)/eventos/[eventId]/page.tsx` — fetch event data, render event details + TicketTypeCard list
- [ ] T025 [US1] Create `TicketTypeCard.tsx` in `frontend/src/features/ticket-types/components/` — shows name, price, availability count, disabled + "Agotado" when sold out, "Comprar" button
- [ ] T026 [US1] Create `ticket-types.endpoints.ts` in `frontend/src/features/ticket-types/api/` — `GET /api/events/:eventId` fetch function
- [ ] T027 [US1] Create `ticket-types.queries.ts` in `frontend/src/features/ticket-types/api/` — TanStack Query hook `useEventWithTicketTypes(eventId)`
- [ ] T028 [US1] Create `ticket-types.schema.ts` in `frontend/src/features/ticket-types/schemas/` — TypeScript types for event + ticket type response
- [ ] T029 [US1] Add "Comprar" button on TicketTypeCard — unauthenticated redirects to `/login?returnUrl=/eventos/{eventId}`, authenticated triggers reservation modal

**Checkpoint***: US1 complete — public event page visible, availability live, "Comprar" button auth-aware

---

## Phase 3: User Story 2 — Admin Ticket Type Management (Priority: P1)

**Goal**: Admin creates, edits, deactivates ticket types

**Independent Test**: Log in as admin, create ticket type, verify on public page. Deactivate type with tickets, verify hidden from public but record persists.

### Backend

- [x] T030 [P] [US2] Extend `ticket-types.repository.ts` — add `create()`, `update()`, `softDelete()`, `findById()` methods
- [x] T031 [US2] Extend `ticket-types.service.ts` — add CRUD business logic with validation (reject hard-delete if tickets exist)
- [x] T032 [US2] Create `ticket-types.controller.ts` admin handlers — `POST /api/admin/ticket-types`, `PATCH /api/admin/ticket-types/:id`, `DELETE /api/admin/ticket-types/:id`
- [x] T033 [US2] Extend `ticket-types.validators.ts` — Zod schemas for create/update payloads (name, price Decimal, quantityTotal, maxPerUser, isActive)
- [x] T034 [US2] Add admin routes to `ticket-types.routes.ts` — mount under `authMiddleware + adminMiddleware + requireRole('super_admin', 'organizer')`

### Frontend

- [x] T035 [US2] Create `frontend/src/app/admin/ticket-types/page.tsx` — admin list page with TicketTypeCard
- [x] T036 [US2] Create `TicketTypeForm.tsx` in `frontend/src/features/ticket-types/components/` — form with name, price, quantity, maxPerUser, saleEndsAt fields
- [x] T037 [US2] Add admin endpoints to `ticket-types.endpoints.ts` — `POST`, `PATCH`, `DELETE` for ticket types
- [x] T038 [US2] Add admin queries to `ticket-types.queries.ts` — `useTicketTypes()`, `useCreateTicketType()`, `useUpdateTicketType()`, `useDeactivateTicketType()`

**Checkpoint**: US2 complete — admin full CRUD on ticket types, public page reflects changes

---

## Phase 4: User Story 3 — Ticket Reservation (Priority: P1)

**Goal**: Authenticated user reserves tickets (1-4) atomically, receives unique code + QR token

**Independent Test**: Log in, reserve 2 tickets for available type, verify unique codes (`FM26-XXXX`) and QR tokens returned. Two concurrent requests for last slot → one succeeds, one gets 409.

### Backend

- [ ] T039 Create `backend/src/modules/tickets/tickets.qr.ts` — `signQrToken(payload)` signs JWT with `QR_JWT_SECRET`, payload: `{ ticket_code, event_id, user_id, ticket_type_id }`. `verifyQrToken(token)` for future check-in use.
- [ ] T040 Create `backend/src/modules/tickets/tickets.types.ts` — interfaces for reserve request/response, ticket status types
- [ ] T041 Create `backend/src/modules/tickets/tickets.validators.ts` — Zod schema: `{ ticketTypeId: uuid, quantity: z.number().int().min(1).max(4) }`
- [ ] T042 Create `backend/src/modules/tickets/tickets.repository.ts` — `reserveAtomic(ticketTypeId, quantity, userId, eventId)` using `prisma.$transaction`:
  - `SELECT ... FROM ticket_types WHERE id = X FOR UPDATE` (raw SQL)
  - Check `quantityTotal - quantitySold >= quantity`, else conflict
  - Check user has no active `reserved` tickets for this event
  - `SELECT nextval('ticket_seq')` × quantity (raw SQL)
  - Generate ticket codes: `{event.prefix}-{LPAD(seq,4,'0')}`
  - Generate QR tokens via `tickets.qr.ts`
  - `prisma.ticket.createMany()` with all tickets (status: `reserved`, `reserveExpiresAt: now + 10min`)
- [ ] T043 Create `backend/src/modules/tickets/tickets.service.ts` — validates request, fetches event/ticket type, calls `reserveAtomic`, handles `409 Conflict`
- [ ] T044 Create `backend/src/modules/tickets/tickets.controller.ts` — `POST /api/tickets/reserve` handler, `GET /api/tickets/my-reservations` handler
- [ ] T045 Create `backend/src/modules/tickets/tickets.routes.ts` — mount under `authMiddleware`

### Frontend

- [ ] T046 [US3] Create `TicketSelector.tsx` in `frontend/src/features/tickets/components/` — quantity picker (1-4), "Comprar" submit button, loading/error states
- [ ] T047 [US3] Create `tickets.endpoints.ts` in `frontend/src/features/tickets/api/` — `POST /api/tickets/reserve`, `GET /api/tickets/my-reservations`
- [ ] T048 [US3] Create `tickets.queries.ts` in `frontend/src/features/tickets/api/` — `useReserveTickets()` mutation, `useMyReservations()` query
- [ ] T049 [US3] Create `tickets.schema.ts` in `frontend/src/features/tickets/schemas/` — TypeScript types for reservation request/response
- [ ] T050 [US3] Integrate TicketSelector into event page — clicking "Comprar" on TicketTypeCard opens selector with chosen type pre-selected

**Checkpoint**: US3 complete — atomic reservation works, QR tokens generated, concurrent safety verified

---

## Phase 5: User Story 4 — Reservation Expiration (Priority: P2)

**Goal**: Stale reservations expire after 10 min, recovered via cron every 2 min

**Independent Test**: Create reservation, wait 10+ min, verify status changes to `expired` within 2-min window, availability recovers.

- [ ] T051 [US4] `npm install node-cron` in backend
- [ ] T052 [US4] Create `backend/src/shared/jobs/expire-reservations.job.ts` — cron `*/2 * * * *` runs `prisma.ticket.updateMany({ where: { status: 'reserved', reserveExpiresAt: { lte: new Date() } }, data: { status: 'expired' } })`
- [ ] T053 [US4] Start cron job in main server entry point — call `startExpirationJob()` on bootstrap

**Checkpoint**: US4 complete — cron marks expired reservations, inventory recovers

---

## Phase 6: User Story 5 — Reservation Countdown Timer (Priority: P2)

**Goal**: User sees countdown anchored to server `reserve_expires_at`, not client clock

**Independent Test**: Complete reservation, verify countdown from ~10 min, refresh page — timer recalculates from server timestamp.

- [ ] T054 [US5] Create `frontend/src/features/tickets/hooks/useReservationTimer.ts` — hook takes `reserveExpiresAt` (server ISO string), returns `{ remainingSeconds, isExpired }`, recalculates every second, uses server time offset
- [ ] T055 [US5] Create `ReservationTimer.tsx` in `frontend/src/features/tickets/components/` — displays MM:SS countdown, shows "Expirado" when expired
- [ ] T056 [US5] Create `ReservationExpired.tsx` in `frontend/src/features/tickets/components/` — shown when reservation expires client-side, prompts user to re-reserve
- [ ] T057 [US5] Integrate ReservationTimer into reservation success view — show after successful reserve, refresh on page load from server data

**Checkpoint**: US5 complete — countdown timer displays correctly regardless of client clock

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [ ] T058 [P] Verify `ticket_code` format `{prefix}-{LPAD(seq,4,'0')}` across all generated tickets — confirm no formatting bugs
- [ ] T059 Run full flow: seed → create ticket type → view public page → reserve → confirm expiration → verify timer
- [ ] T060 Clean up any TODO comments or debug code

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately. BLOCKS all user stories
- **Phase 2 (US1)**: Depends on Phase 1 — public event page needs schema + seed
- **Phase 3 (US2)**: Depends on Phase 1 — admin CRUD needs schema
- **Phase 4 (US3)**: Depends on Phases 1 + 2 — reservation needs public event page flow
- **Phase 5 (US4)**: Depends on Phase 1 + 4 — cron needs schema + reservation flow exists
- **Phase 6 (US5)**: Depends on Phase 4 — timer needs reservation response data
- **Phase 7 (Polish)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1) MVP**: Independent after Phase 1 — no other story dependencies
- **US2 (P1)**: Independent after Phase 1 — can run parallel with US1
- **US3 (P1)**: Needs US1 for event page integration — backend reservation API independent of US1 frontend
- **US4 (P2)**: Needs US3 for reservation data to expire
- **US5 (P2)**: Needs US3 for reservation data to show timer

### Within Each User Story

- Types before services
- Services before controllers
- Controllers before routes
- Backend endpoints before frontend integration
- Story complete before moving to next

### Parallel Opportunities

- T002, T003, T004 can run in parallel (different schema sections)
- T030 [P] and T019 can run in parallel (different repos in same module)
- US1 frontend (T024-T029) and US2 (T030-T038) can run in parallel after Phase 1
- T051 and T052 can run in parallel
- All [P]-marked tasks run independently

---

## Implementation Strategy

### MVP First (Phase 1 + US1 Only)

1. Complete Phase 1: Schema + Migration + Seed + Config
2. Complete US1: Public event browsing
3. **STOP and validate**: Event page visible, availability live, "Comprar" auth-aware
4. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 complete → Schema ready
2. Add US1 → Event page live (MVP!)
3. Add US2 → Admin can manage ticket types
4. Add US3 → Users can reserve tickets
5. Add US4 → Expired reservations cleanup
6. Add US5 → Countdown timer UX

### Parallel Team Strategy

With multiple developers:
1. Team completes Phase 1 together
2. Dev A: US1 (public page)
3. Dev B: US2 (admin CRUD — independent of US1)
4. Dev C (after US1): US3 (reservation backend + frontend)
5. Dev A (after US1): US4 (cron) + US5 (timer) — lightweight, can be combined

---

## Task Summary

| Phase | Story | Tasks | Count |
|-------|-------|-------|-------|
| 1 | Setup | T001-T018 | 18 |
| 2 | US1 (P1) | T019-T029 | 11 |
| 3 | US2 (P1) | T030-T038 | 9 |
| 4 | US3 (P1) | T039-T050 | 12 |
| 5 | US4 (P2) | T051-T053 | 3 |
| 6 | US5 (P2) | T054-T057 | 4 |
| 7 | Polish | T058-T060 | 3 |
| | **Total** | | **60** |
