# Tasks: Check-in and Remote Confirmation

**Input**: Design documents from `specs/017-checkin-confirmation/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included — user explicitly requests race condition tests.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Path Conventions

- **Backend**: `src/modules/checkin/`, `src/modules/confirmations/` at repository root
- **Tests**: `backend/tests/` (project convention — Vitest)

---

## Phase 1: Setup

**Purpose**: Clean slate and environment configuration

- [x] T001 Delete existing `src/modules/checkin/` entirely (old single-endpoint `POST /internal/checkin` attempt)
- [x] T002 [P] Add `CONFIRMATION_JWT_SECRET`, `CONFIRMATION_TOKEN_TTL`, `CONFIRMATION_LINK_BASE_URL` to `src/env.ts` and `.env.example`
- [x] T003 [P] Create `src/modules/checkin/checkin.types.ts` with `TicketSummary` type, `CheckerAction` union, and pure function `getAllowedActions(status): CheckerAction[]`
- [x] T004 [P] Create `src/modules/checkin/checkin.validators.ts` with `scanSchema` and `ticketActionSchema` Zod schemas

**Checkpoint**: Foundation ready — types and validators available for all stories

---

## Phase 3: User Story 1 — Direct Entry (Priority: P1) 🎯 MVP

**Goal**: Checker scans QR, ticket is in `paid` state, buyer present — direct confirm-entry. Ticket transitions `paid → used`. Scanned ticket info displayed for any status.

**Independent Test**: Scan QR for `paid` ticket → `confirm_entry_direct` appears in allowedActions → call confirm-entry → response 200 → scan again → status is `used` with `checkedInAt` timestamp.

### Implementation for User Story 1

- [x] T005 [US1] Create `src/modules/checkin/checkin.repository.ts` with: `findTicketForScan(ticketId)` (no lock), `confirmEntryDirect(ticketId, checkerId)`, `requestConfirmation(ticketId, checkerId)`, `allowEntry(ticketId, checkerId)`, `confirmTicket(ticketId)`, `rejectConfirmation(ticketId)` — fix the bug where `rejectConfirmation` doesn't distinguish success from error (return boolean or affected count)
- [x] T006 [US1] Create `src/modules/checkin/checkin.service.ts` with `scanTicket(qrToken)` (decode JWT via `QR_JWT_SECRET`, call `findTicketForScan`, compute `allowedActions` via `getAllowedActions`) and `confirmEntryDirect(ticketId, checkerId)` (transition `paid → used`, map affected-rows-zero to `TICKET_NOT_AVAILABLE`)
- [x] T007 [US1] Create `src/modules/checkin/checkin.controller.ts` with Express handlers for `POST /scan` and `POST /confirm-entry` — validate body with Zod, call service, map errors to status codes
- [x] T008 [US1] Create `src/modules/checkin/checkin.routes.ts` — `Router()` mounting controller handlers, apply `requireRole('checker', 'admin')` middleware

**Checkpoint**: Direct entry flow functional — checker can scan, see ticket info, and confirm entry. MVP deliverable.

---

## Phase 4: User Story 2 — Remote Confirmation (Priority: P1)

**Goal**: Checker scans QR for `paid` ticket, buyer not present — requests confirmation. Buyer clicks link → ticket becomes `confirmed`. Checker scans again → sees `allow_entry` action → allows entry. Also covers User Story 3 (buyer reject).

**Independent Test**: Scan QR for `paid` ticket → request-confirmation → status becomes `pending_confirmation` → call confirmations confirm endpoint with valid JWT → status becomes `confirmed` → scan → `allow_entry` appears → allow-entry → status `used`.

### Implementation for User Story 2

- [x] T009 [US2] Create `src/modules/messaging/` module — `messaging.types.ts` (`MessagingClient` interface, `ConfirmationLinkPayload`, `MessagingChannel`), `messaging.client.ts` (`ConsoleMessagingClient` stub), `index.ts` re-export. checkin imports via `../messaging/index.js`
- [x] T010 [US2] Complete `src/modules/checkin/checkin.service.ts`: add `requestConfirmation(ticketId, checkerId)` (transition `paid → pending_confirmation`, generate confirmation JWT signed with `CONFIRMATION_JWT_SECRET`, build confirmation link, call `messaging.client.sendConfirmationLink`, log only `ticketId` — never log the JWT) and `allowEntry(ticketId, checkerId)` (transition `confirmed → used`)
- [x] T011 [US2] Create `src/modules/confirmations/confirmations.middleware.ts` — verifies `CONFIRMATION_JWT_SECRET`, checks `purpose: 'confirm'`, attaches decoded `ticketId` to `req`, distinguishes `TokenExpiredError` vs `JsonWebTokenError`
- [x] T012 [US2] Create `src/modules/confirmations/confirmations.types.ts` (response types, error codes)
- [x] T013 [US2] Create `src/modules/confirmations/confirmations.validators.ts` — Zod schemas for confirm and reject (token required, non-empty string)
- [x] T014 [US2] Create `src/modules/confirmations/confirmations.service.ts` with `confirm(ticketId)` (transition `pending_confirmation → confirmed` via `checkin.repository.confirmTicket`) and `reject(ticketId)` (transition `pending_confirmation → paid` via `checkin.repository.rejectConfirmation`)
- [x] T015 [US2] Create `src/modules/confirmations/confirmations.controller.ts` with handlers for `POST /confirm` and `POST /reject` — parse token from body, verify via middleware, extract `ticketId`, call service, map errors
- [x] T016 [US2] Create `src/modules/confirmations/confirmations.routes.ts` — `Router()` mounting controller handlers (no session auth — authenticated by confirmation JWT middleware)

**Checkpoint**: Full remote confirmation flow works — scan → request → buyer confirms/rejects → scan again → allow entry.

---

## Phase 5: Wire Routes & Polish

**Purpose**: Mount both routers in main app and finalize

- [x] T017 Mount `checkin.routes` on `/internal/checkin` and `confirmations.routes` on `/confirmations` in main Express app (`src/app.ts` or equivalent entry point)
- [x] T018 Write Vitest race condition test: two concurrent `confirm-entry` requests on the same ticket → first returns 200, second returns 409 `TICKET_NOT_AVAILABLE` (use `Promise.all` to fire both simultaneously)

**Checkpoint**: All endpoints wired and verified.

---

## Phase 6: Documentation

- [x] T019 Update `docs/spec-tickets-lifecycle.md` to include `pending_confirmation ⇄ paid ⇄ confirmed` transitions in state diagram

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — no story dependencies
- **US2+US3 (Phase 4)**: Depends on Foundational + US1 (shares `checkin.repository` and `checkin.service`)
- **Wire & Polish (Phase 5)**: Depends on US1 + US2 completion
- **Documentation (Phase 6)**: Depends on all phases

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — independent, no story dependencies
- **US2+US3 (P1+P2)**: Depends on `checkin.repository` and `checkin.service` skeleton from US1 — adds request/confirm/reject methods to existing files
- **US4 (P3)**: Covered within US2 (token expiry handling in middleware is part of confirmations module)

### Within Each User Story

- Types + validators before services
- Repository before service
- Service before controller
- Controller before routes

### Parallel Opportunities

- T002, T003, T004 [P] — all independent file creations
- T011, T012, T013 [P] — confirmations module files can be created in parallel

---

## Parallel Example: US2 (Remote Confirmation)

```bash
# Launch parallel file creations:
Task: "Create confirmations.middleware.ts"
Task: "Create confirmations.validators.ts + confirmations.types.ts"
Task: "Create messaging.client.ts"

# Then sequential:
Task: "confirmations.service.ts (depends on types + middleware)"
Task: "confirmations.controller.ts (depends on service)"
Task: "confirmations.routes.ts (depends on controller)"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (Direct entry)
4. **STOP and VALIDATE**: Test scan → confirm-entry → used flow
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Direct entry) → Test independently → Deploy/Demo (MVP!)
3. Add US2+US3 (Remote confirm/reject) → Test full flow → Deploy/Demo
4. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Complete Phases 1-2 together
2. Developer A: US1 (Phase 3) — types, validators, repository, service, controller, routes
3. Developer B: US2+US3 (Phase 4) — confirmation middleware, types, validators, service, controller, routes
4. Merge after both complete — verify integration (both share `checkin.repository`)
5. Developer A or B: Phase 5 (wire routes + race test)
6. Final: Phase 6 (documentation)

---

## Summary

| Metric | Count |
|--------|-------|
| Total tasks | 19 |
| Setup (Phase 1) | 2 |
| Foundational (Phase 2) | 2 |
| US1 — Direct entry (Phase 3) | 4 |
| US2 — Remote confirmation (Phase 4) | 8 |
| Wire & Polish (Phase 5) | 2 |
| Documentation (Phase 6) | 1 |
| Parallel tasks ([P]) | 5 |
| Test tasks | 1 |
| MVP scope | US1 (Phase 3, 4 tasks) |

**Independent test criteria**:
- **US1**: Scan `paid` ticket → confirm-entry → 200 → rescan → `used` with timestamp
- **US2+US3**: Scan `paid` → request-confirmation → `pending_confirmation` → buyer confirms via token → `confirmed` → rescan → allow-entry → `used`; or buyer rejects → `paid`
- **Race condition**: Two concurrent confirm-entry on same ticket → one 200, one 409
