# Tasks: Admin Payments Manager

**Input**: Design documents from `/specs/013-admin-payments-manager/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests requested by user — include test tasks per user story.

**Organization**: Tasks grouped by user story for independent implementation/testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Schema changes, validation, types, and module structure — must complete before any user story.

- [X] T001 Add `partially_refunded` to `PaymentStatus` enum in `backend/prisma/schema.prisma`
- [X] T002 Add `Refund` model with `RefundStatus` enum in `backend/prisma/schema.prisma`
- [X] T003 [P] Add refund types (`RefundRecord`, `RefundStatus`, `RefundInput`, `PaymentFilters`) in `backend/src/modules/payments/payments.types.ts`
- [X] T004 [P] Add `paymentFiltersSchema` and `refundSchema` Zod validators in `backend/src/modules/admins/admins.validators.ts`
- [X] T005 Create frontend `features/admin-payments/` module structure (api/, components/\_\_tests\_\_/, hooks/, schemas/)
- [X] T006 [P] Create frontend Zod schemas (`paymentFiltersSchema`, `refundFormSchema`) in `frontend/features/admin-payments/schemas/admin-payments.schema.ts`

**Checkpoint**: Foundation ready — backend types + schemas + frontend module structure exist.

---

## Phase 2: User Story 1 — View and filter payment list (Priority: P1) 🎯 MVP

**Goal**: Admin sees paginated table of payments with search (name, cedula, email), status filter, and date range filter.

**Independent Test**: Admin loads `/admin/pagos`, verifies rows appear with correct columns. Apply filters and verify list narrows.

### Backend — Enhanced list endpoint with filters

- [ ] T007 [P] [US1] Add dynamic where clauses (status, dateFrom, dateTo, search on user.fullName/user.cedula/user.email) to `findAllPayments` in `backend/src/modules/payments/payments.repository.ts`
- [ ] T008 [P] [US1] Add `findAllPaymentsFiltered` method in `backend/src/modules/payments/payments.repository.ts`
- [ ] T009 [P] [US1] Enhance `listAllPayments` in `backend/src/modules/payments/payments.service.ts` to accept and pass filter params
- [ ] T010 [US1] Update `listPaymentsHandler` in `backend/src/modules/admins/admins.controller.ts` to parse new filter query params

### Backend — Tests

- [ ] T011 [P] [US1] Test `paymentFiltersSchema` validation in `backend/src/modules/admins/__tests__/admin-payments.validators.test.ts`
- [ ] T012 [US1] Test `listAllPayments` with filters in `backend/src/modules/payments/__tests__/payments.service.test.ts`

### Frontend — API queries

- [ ] T013 [P] [US1] Create `usePayments` query hook with filter params in `frontend/features/admin-payments/api/admin-payments.queries.ts`
- [ ] T014 [US1] Test `usePayments` query hook in `frontend/features/admin-payments/api/__tests__/admin-payments.queries.test.ts`

### Frontend — Components

- [ ] T015 [P] [US1] Create `PaymentsTableSkeleton` loading component in `frontend/features/admin-payments/components/PaymentsTableSkeleton.tsx`
- [ ] T016 [P] [US1] Create `PaymentsError` component in `frontend/features/admin-payments/components/PaymentsError.tsx`
- [ ] T017 [P] [US1] Create `PaymentsEmpty` empty-state component in `frontend/features/admin-payments/components/PaymentsEmpty.tsx`
- [ ] T018 [P] [US1] Create `PaymentsTable` row component in `frontend/features/admin-payments/components/PaymentsTable.tsx`
- [ ] T019 [P] [US1] Create `PaymentFilters` component (status dropdown, date range, search input) in `frontend/features/admin-payments/components/PaymentFilters.tsx`
- [ ] T020 [US1] Create `PaymentsList` orchestrator component that composes table, filters, skeleton in `frontend/features/admin-payments/components/PaymentsList.tsx`

### Frontend — Routes & Nav

- [ ] T021 [US1] Create route page `frontend/app/admin/pagos/page.tsx` (delegates to `PaymentsList`)
- [ ] T022 [US1] Add `/admin/pagos` role restriction in `frontend/app/admin/layout.tsx`
- [ ] T023 [US1] Add "Pagos" link to admin sidebar in `frontend/shared/components/AdminSidebar.tsx`

### Frontend — Component Tests

- [ ] T024 [P] [US1] Test `PaymentsTable` renders rows and formats currency in `frontend/features/admin-payments/components/__tests__/PaymentsTable.test.tsx`
- [ ] T025 [P] [US1] Test `PaymentFilters` calls onChange for status/search/date in `frontend/features/admin-payments/components/__tests__/PaymentFilters.test.tsx`
- [ ] T026 [P] [US1] Test `PaymentsEmpty` renders correct message in `frontend/features/admin-payments/components/__tests__/PaymentsEmpty.test.tsx`
- [ ] T027 [US1] Test `PaymentsList` integration (mock `usePayments`, verify loading/error/data states) in `frontend/features/admin-payments/components/__tests__/PaymentsList.test.tsx`

**Checkpoint**: Admin can view, search, and filter payments. MVP deliverable.

---

## Phase 3: User Story 2 — View payment detail (Priority: P1)

**Goal**: Admin clicks a payment row and sees full detail with user info, tickets, and refunds.

**Independent Test**: Admin clicks payment row, detail view shows amount, status, user, tickets, and refund history.

### Backend

- [ ] T028 [US2] Add `refunds` include to `findPaymentByIdWithUser` in `backend/src/modules/payments/payments.repository.ts` (include Refund model with processedBy user)

### Frontend

- [ ] T029 [P] [US2] Add `usePaymentDetail` query hook in `frontend/features/admin-payments/api/admin-payments.queries.ts`
- [ ] T030 [US2] Create `PaymentDetail` component (user info, tickets table, refunds list) in `frontend/features/admin-payments/components/PaymentDetail.tsx`
- [ ] T031 [US2] Create route page `frontend/app/admin/pagos/[id]/page.tsx`
- [ ] T032 [US2] Wire PaymentTable row click → navigate to `/admin/pagos/[id]`

### Tests

- [ ] T033 [P] [US2] Test `usePaymentDetail` query in `frontend/features/admin-payments/api/__tests__/admin-payments.queries.test.ts`
- [ ] T034 [US2] Test `PaymentDetail` renders user info, tickets, refunds in `frontend/features/admin-payments/components/__tests__/PaymentDetail.test.tsx`

**Checkpoint**: Admin can drill into any payment for full detail.

---

## Phase 4: User Story 3 — Process refund (Priority: P2)

**Goal**: Admin initiates full or partial refund from payment detail. System processes via Mercado Pago and records refund.

**Independent Test**: Admin clicks "Reembolsar" on completed payment, enters amount+reason, confirms. Payment status updates, refund appears in history.

### Backend — Mercado Pago integration

- [ ] T035 [US3] Add `processRefund` method to `MercadoPagoProvider` in `backend/src/modules/payments/providers/mercadopago.provider.ts`
- [ ] T036 [US3] Add `processRefund` signature to `PaymentProvider` interface in `backend/src/modules/payments/payments.types.ts`
- [ ] T037 [US3] Register refund capability in `provider.registry.ts` (or call `paymentsRepo` after gateway refund)

### Backend — Refund logic

- [ ] T038 [P] [US3] Add `createRefund` method in `backend/src/modules/payments/payments.repository.ts`
- [ ] T039 [P] [US3] Add `getRefundBalance` (payment.amountCents - sum of prior refunds) in `backend/src/modules/payments/payments.repository.ts`
- [ ] T040 [US3] Add `processRefund` service method (validate balance, call gateway, create record, update payment status) in `backend/src/modules/payments/payments.service.ts`
- [ ] T041 [US3] Add `refundPaymentHandler` in `backend/src/modules/admins/admins.controller.ts`
- [ ] T042 [US3] Add `POST /payments/:id/refund` route in `backend/src/modules/admins/admins.routes.ts`

### Backend — Tests

- [ ] T043 [P] [US3] Test `refundSchema` validation in `backend/src/modules/admins/__tests__/admin-payments.validators.test.ts`
- [ ] T044 [US3] Test `processRefund` service (balance gate, success, gateway error) in `backend/src/modules/payments/__tests__/payments.service.test.ts`

### Frontend

- [ ] T045 [P] [US3] Add `useProcessRefund` mutation hook in `frontend/features/admin-payments/api/admin-payments.queries.ts`
- [ ] T046 [US3] Create `RefundDialog` form component (amount, reason, validation, confirm) in `frontend/features/admin-payments/components/RefundDialog.tsx`
- [ ] T047 [US3] Wire refund button + dialog into `PaymentDetail` component

### Frontend — Tests

- [ ] T048 [P] [US3] Test `useProcessRefund` mutation in `frontend/features/admin-payments/api/__tests__/admin-payments.queries.test.ts`
- [ ] T049 [US3] Test `RefundDialog` form validation (empty reason, exceeds balance) + confirm flow in `frontend/features/admin-payments/components/__tests__/RefundDialog.test.tsx`

**Checkpoint**: Admin can process full and partial refunds end-to-end.

---

## Phase 5: User Story 4 — Export payment report (Priority: P3)

**Goal**: Admin exports filtered payment list as CSV download.

**Independent Test**: Admin applies filters, clicks Export, downloads CSV with matching rows.

- [ ] T050 [US4] Add `GET /api/admin/payments/export` endpoint (controller + route) in `backend/src/modules/admins/`
- [ ] T051 [US4] Create `usePaymentExport` hook (generates CSV, triggers download) in `frontend/features/admin-payments/hooks/usePaymentExport.ts`
- [ ] T052 [US4] Create `PaymentsExport` button component in `frontend/features/admin-payments/components/PaymentsExport.tsx`
- [ ] T053 [US4] Wire `PaymentsExport` into `PaymentsList` component
- [ ] T054 [US4] Test export hook generates correct CSV in `frontend/features/admin-payments/hooks/__tests__/usePaymentExport.test.ts`

**Checkpoint**: Admin can download filtered payment data as CSV.

---

## Phase 6: User Story 5 — Admin manually creates payment for client (Priority: P2)

**Goal**: Admin clicks "Pagar" on a user row from `/admin/usuarios`, selects ticket types + quantities in a modal, confirms. System creates payment with provider=MANUAL, creates tickets with status=paid, increments quantity_sold. Per-user limits (maxPerUser) bypassed for admin purchases.

**Why this priority**: Common admin task — selling tickets in-person or over the phone without payment gateway.

**Independent Test**: Admin clicks "Pagar" on user row, dialog loads ticket types (each showing zero current quantity for this user), admin sets quantities, confirms. Payment appears in `/admin/pagos` with provider=MANUAL. User's tickets appear. Ticket type quantity_sold incremented.

### Backend — Schema

- [ ] T058 [P] [US5] Add optional `createdById` field (FK → users, admin who created) + relation to Payment model in `backend/prisma/schema.prisma`

### Backend — Validation

- [ ] T059 [US5] Add `manualPaymentSchema` Zod validator (userId + items[] with ticketTypeId + quantity, quantity > 0) in `backend/src/modules/admins/admins.validators.ts`

### Backend — Repository

- [ ] T060 [US5] Add `createManualPaymentTransaction` in `backend/src/modules/payments/payments.repository.ts` — Prisma transaction that:
  1. Locks each ticket type row (FOR UPDATE)
  2. Validates stock: for each, `quantity_sold + requested <= quantity_total`
  3. If any fails → rollback, throw `INSUFFICIENT_STOCK` with details
  4. Inserts payment with `provider='MANUAL'`, `status='completed'`, `createdById`
  5. Inserts tickets with `status='paid'`, linked to payment
  6. Increments `quantity_sold` for each ticket type
- [ ] T061 [US5] Add `findAllTicketTypesSimple` (no pagination, active only, basic fields) in `backend/src/modules/payments/payments.repository.ts` — for dialog to fetch available types

### Backend — Service & Controller

- [ ] T062 [US5] Add `processManualPayment` service method in `backend/src/modules/payments/payments.service.ts` — validates userId exists, calls `createManualPaymentTransaction`, returns payment + tickets
- [ ] T063 [US5] Add `createManualPaymentHandler` in `backend/src/modules/admins/admins.controller.ts` — parses body, calls service, returns 201
- [ ] T064 [US5] Add `POST /api/admin/payments/manual` route + `GET /api/admin/ticket-types` (for dialog dropdown) in `backend/src/modules/admins/admins.routes.ts`

### Backend — Tests

- [ ] T065 [P] [US5] Test `manualPaymentSchema` validation (valid input, missing fields, quantity=0) in `backend/src/modules/admins/__tests__/admin-payments.validators.test.ts`
- [ ] T066 [US5] Test `processManualPayment` service (success, insufficient stock, user not found) in `backend/src/modules/payments/__tests__/payments.service.test.ts`

### Frontend — API queries

- [ ] T067 [P] [US5] Add `useTicketTypesSimple` query hook + `useManualPayment` mutation hook in `frontend/features/admin-payments/api/admin-payments.queries.ts`

### Frontend — Components

- [ ] T068 [US5] Create `ManualPaymentDialog` component (fetches ticket types, renders quantity input per type, validates total > 0, confirms) in `frontend/features/admin-payments/components/ManualPaymentDialog.tsx`
- [ ] T069 [US5] Add "Pagar" action button in `UserTableItem` at `frontend/features/admin-users/components/UserTableItem.tsx` — opens `ManualPaymentDialog` with selected user
- [ ] T070 [US5] Wire `ManualPaymentDialog` import + state into `UserTable` at `frontend/features/admin-users/components/UserTable.tsx`

### Frontend — Tests

- [ ] T071 [P] [US5] Test `useManualPayment` mutation in `frontend/features/admin-payments/api/__tests__/admin-payments.queries.test.ts`
- [ ] T072 [US5] Test `ManualPaymentDialog` renders ticket types, validates input, confirms in `frontend/features/admin-payments/components/__tests__/ManualPaymentDialog.test.tsx`

**Checkpoint**: Admin can create a manual payment for any user from usuarios page. Payment shows in list with MANUAL provider. Tickets created as paid, stock updated.

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: Final verification and edge-case handling.

- [ ] T073 Run full `vitest` suite — verify no regressions in `frontend/` and `backend/`
- [ ] T074 Run `prisma generate` after schema changes
- [ ] T075 Verify edge cases: empty state renders when no payments match filters, error state renders on API failure, refund button disabled for non-completed payments, manual payment with insufficient stock shows clear error, manual payment for user with no active ticket types shows empty dialog

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No dependencies — start here. BLOCKS all user stories.
- **Phase 2 (US1)**: Depends on Phase 1 completion
- **Phase 3 (US2)**: Depends on Phase 1 + Phase 2 (payment detail links from list)
- **Phase 4 (US3)**: Depends on Phase 1 + Phase 3 (refund button in detail view)
- **Phase 5 (US4)**: Depends on Phase 1 + Phase 2 (reuses list filters)
- **Phase 6 (US5)**: Depends on Phase 1 (needs Prisma types + back/front structure) — independent of other user stories
- **Phase 7 (Polish)**: Depends on all desired phases complete

### User Story Dependencies

- **US1 (P1)**: No story dependencies — can start after Foundational
- **US2 (P1)**: Depends on US1 (navigation from list row)
- **US3 (P2)**: Depends on US2 (refund button lives in detail view)
- **US4 (P3)**: Depends on US1 (reuses filter state from list)
- **US5 (P2)**: Depends on Foundational only — independent of US1-US4 (new button on usuarios page, not on payment list)

### Within Each Phase

- Marked `[P]` tasks can run in parallel
- Backend before frontend for each story (API must exist before UI consumes it)
- Tests after implementation within each story

### Parallel Opportunities

- T003 + T004 (backend types + validators)
- T015 + T016 + T017 + T018 + T019 (frontend SKUs, any order)
- T024 + T025 + T026 (component tests, different files)
- T058 (Prisma schema) + T059 (validators) can start simultaneously
- T067 (frontend hooks) + T068 (dialog component) can run in parallel
- T065 + T066 (backend tests, different files)

---

## Implementation Strategy

### MVP (Phases 1-2 only)

1. Complete Phase 1: Foundational (Prisma, types, schemas, module structure)
2. Complete Phase 2: US1 — Payment list with filters
3. **STOP and VALIDATE**: Test US1 independently
4. Deploy/demo: Admin can view and search payments

### Incremental Delivery

1. Foundation + US1 → MVP (view + search payments)
2. Add US2 → Payment detail (drill-down)
3. Add US3 → Refund processing (full feature)
4. Add US4 → CSV export (bonus)
5. Add US5 → Manual payment creation (admin sales)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps to spec.md user stories
- Each user story independently testable
- Search by `user.fullName`, `user.cedula`, or `user.email` (ILIKE)
- All user-facing strings in Spanish
- Follow existing patterns: `vi.mock` for hook tests, `TestWrapper` from `@/test/test-utils`, `fireEvent.change` for non-matching accept attribute in file upload tests

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| Phase 1: Foundational | T001–T006 | Prisma schema, types, validators, frontend structure |
| Phase 2: US1 | T007–T027 | Payment list with filters — backend + frontend + tests |
| Phase 3: US2 | T028–T034 | Payment detail — backend + frontend + tests |
| Phase 4: US3 | T035–T049 | Refund processing — backend + frontend + tests |
| Phase 5: US4 | T050–T054 | CSV export — backend + frontend + tests |
| Phase 6: US5 | T058–T072 | Manual payment creation — backend + frontend + tests |
| Phase 7: Polish | T073–T075 | Final verification |
| **Total** | **72 tasks** | |

72 tasks across 7 phases. 20 marked parallel (`[P]`).
