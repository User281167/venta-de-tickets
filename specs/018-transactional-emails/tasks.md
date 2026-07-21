# Tasks: Transactional Email Module

**Input**: Design documents from `/specs/018-transactional-emails/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual verification only — no automated tests requested in spec.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install email SDK and configure environment

- [x] T001 Install `resend` npm package in `backend/package.json`
- [x] T002 [P] Add `RESEND_API_KEY` and `EMAIL_FROM` to `backend/.env.example`
- [x] T003 [P] Add `RESEND_API_KEY` and `EMAIL_FROM` to `backend/src/shared/config/env.ts` schema

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core email infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create `EmailProvider` interface in `backend/src/modules/messaging/channels/email-provider.interface.ts`
- [x] T005 [P] Implement `ResendProvider` in `backend/src/modules/messaging/channels/resend.provider.ts` (import Resend SDK, implement `send()` with try/catch + logger.error)
- [x] T006 [P] Create provider registry in `backend/src/modules/messaging/channels/channel.registry.ts` with `getEmailProvider(): EmailProvider` (mirror `provider.registry.ts` pattern)
- [x] T007 [P] Create `renderTemplate()` function in `backend/src/modules/messaging/templates/render-template.ts` (read `.html` file, replace `{{var}}` placeholders, return string)

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 — Payment Confirmation Email (Priority: P1) 🎯 MVP

**Goal**: Buyer receives email when payment transitions to `paid`

**Independent Test**: Trigger a payment approval in Mercado Pago sandbox and verify buyer receives email with correct amount, event name, and date

### Implementation for User Story 1

- [x] T008 [P] [US1] Create `payment-confirmed.html` template in `backend/src/modules/messaging/templates/` with fields: `customerName`, `amount`, `eventName`, `paymentDate`
- [x] T009 [US1] Create `messaging.service.ts` in `backend/src/modules/messaging/` with `sendPaymentConfirmation(payment)` method (fire-and-forget, uses getEmailProvider + renderTemplate)
- [x] T010 [US1] Export `messagingService` from `backend/src/modules/messaging/index.ts`
- [x] T011 [US1] Integrate `messagingService.sendPaymentConfirmation()` into `backend/src/modules/payments/payments.service.ts` — call after `markAsPaid` DB commit with `void` prefix

**Checkpoint**: Payment confirmed email sends when payment is approved

---

## Phase 4: User Story 2 — Ticket Confirmation Email (Priority: P1)

**Goal**: Buyer receives email with QR when ticket is confirmed

**Independent Test**: Confirm a ticket via admin or confirmation link and verify buyer receives email with QR image URL and ticket ID

### Implementation for User Story 2

- [ ] T012 [P] [US2] Create `ticket-confirmed.html` template in `backend/src/modules/messaging/templates/` with fields: `customerName`, `eventName`, `qrImageUrl`, `ticketId`
- [ ] T013 [US2] Add `sendTicketConfirmation(ticket)` method to `messaging.service.ts` in `backend/src/modules/messaging/messaging.service.ts`
- [ ] T014 [US2] Integrate `messagingService.sendTicketConfirmation()` into `backend/src/modules/tickets/tickets.service.ts` — call after `confirm` DB commit with `void` prefix

**Checkpoint**: Ticket confirmed email sends when ticket transitions to confirmed

---

## Phase 5: User Story 3 — Ticket Cancellation Email (Priority: P2)

**Goal**: Buyer receives notification when ticket is cancelled

**Independent Test**: Cancel a ticket from any status and verify buyer receives cancellation email with ticket ID and event name

### Implementation for User Story 3

- [ ] T015 [P] [US3] Create `ticket-cancelled.html` template in `backend/src/modules/messaging/templates/` with fields: `customerName`, `eventName`, `ticketId`
- [ ] T016 [US3] Add `sendTicketCancellation(ticket)` method to `messaging.service.ts` in `backend/src/modules/messaging/messaging.service.ts`
- [ ] T017 [US3] Integrate `messagingService.sendTicketCancellation()` into `backend/src/modules/tickets/tickets.service.ts` — call after `cancel` DB commit with `void` prefix

**Checkpoint**: Ticket cancelled email sends when ticket transitions to cancelled

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Manual verification and cleanup

- [ ] T018 Add `messaging.service.ts` export to `backend/src/modules/messaging/index.ts` (verify all 3 methods exported)
- [ ] T019 Manual test: force payment approval in Mercado Pago sandbox → verify `payment-confirmed` email received
- [ ] T020 Manual test: confirm a ticket → verify `ticket-confirmed` email with QR URL received
- [ ] T021 Manual test: cancel a ticket → verify `ticket-cancelled` email received
- [ ] T022 Run `npm run typecheck` and `npm run lint` in backend/ to verify no type/lint errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3–5)**: All depend on Foundational completion
  - Stories can proceed sequentially in priority order (US1 → US2 → US3)
- **Polish (Phase 6)**: Depends on all stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — No dependencies on other stories
- **US2 (P1)**: Can start after Phase 2 — No dependencies on US1
- **US3 (P2)**: Can start after Phase 2 — No dependencies on US1 or US2

### Within Each User Story

- Template (independent) → service method → integration in caller
- Template tasks marked [P] can run in parallel within a story
- Story complete before moving to next priority

### Parallel Opportunities

- T002, T003 (Setup env vars) can run in parallel
- T005, T006, T007 (provider, registry, renderer) can run in parallel
- T008, T012, T015 (all HTML templates) can run in parallel across stories
- All story integrations (T011, T014, T017) modify different files — can run in parallel

---

## Parallel Example: All User Stories

```bash
# All 3 templates can be created simultaneously:
Task: T008 Create payment-confirmed.html
Task: T012 Create ticket-confirmed.html
Task: T015 Create ticket-cancelled.html

# All 3 integrations modify different services — can be done in parallel:
Task: T011 Wire into payments.service.ts
Task: T014 Wire into tickets.service.ts (confirm)
Task: T017 Wire into tickets.service.ts (cancel)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Payment Confirmation)
4. **STOP and VALIDATE**: Trigger sandbox payment → verify email
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → email infrastructure ready
2. Add US1 (Payment Confirmation) → Test independently → Deploy/Demo (MVP!)
3. Add US2 (Ticket Confirmation) → Test independently → Deploy/Demo
4. Add US3 (Ticket Cancellation) → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:
1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (payment confirmation)
   - Developer B: US2 (ticket confirmation)
   - Developer C: US3 (ticket cancellation)
3. All 3 stories are independent — each developer works on separate files

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- No automated tests required per spec — manual verification only
- Fire-and-forget pattern: use `void` prefix, never `await`
- Env vars needed before ResendProvider works: `RESEND_API_KEY`, `EMAIL_FROM`
- Existing `ConsoleMessagingClient` stub remains untouched
