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

- [ ] T001 Add `partially_refunded` to `PaymentStatus` enum in `backend/prisma/schema.prisma`
- [ ] T002 Add `Refund` model with `RefundStatus` enum in `backend/prisma/schema.prisma`
- [ ] T003 [P] Add refund types (`RefundRecord`, `RefundStatus`, `RefundInput`, `PaymentFilters`) in `backend/src/modules/payments/payments.types.ts`
- [ ] T004 [P] Add `paymentFiltersSchema` and `refundSchema` Zod validators in `backend/src/modules/admins/admins.validators.ts`
- [ ] T005 Create frontend `features/admin-payments/` module structure (api/, components/\_\_tests\_\_/, hooks/, schemas/)
- [ ] T006 [P] Create frontend Zod schemas (`paymentFiltersSchema`, `refundFormSchema`) in `frontend/features/admin-payments/schemas/admin-payments.schema.ts`

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

## Phase 6: Polish & Cross-Cutting

**Purpose**: Final verification and edge-case handling.

- [ ] T055 Run full `vitest` suite — verify no regressions in `frontend/` and `backend/`
- [ ] T056 Run `prisma generate` after schema changes
- [ ] T057 Verify edge cases: empty state renders when no payments match filters, error state renders on API failure, refund button disabled for non-completed payments

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No dependencies — start here. BLOCKS all user stories.
- **Phase 2 (US1)**: Depends on Phase 1 completion
- **Phase 3 (US2)**: Depends on Phase 1 + Phase 2 (payment detail links from list)
- **Phase 4 (US3)**: Depends on Phase 1 + Phase 3 (refund button in detail view)
- **Phase 5 (US4)**: Depends on Phase 1 + Phase 2 (reuses list filters)
- **Phase 6 (Polish)**: Depends on all desired phases complete

### User Story Dependencies

- **US1 (P1)**: No story dependencies — can start after Foundational
- **US2 (P1)**: Depends on US1 (navigation from list row)
- **US3 (P2)**: Depends on US2 (refund button lives in detail view)
- **US4 (P3)**: Depends on US1 (reuses filter state from list)

### Within Each Phase

- Marked `[P]` tasks can run in parallel
- Backend before frontend for each story (API must exist before UI consumes it)
- Tests after implementation within each story

### Parallel Opportunities

- T003 + T004 (backend types + validators)
- T015 + T016 + T017 + T018 + T019 (frontend SKUs, any order)
- T024 + T025 + T026 (component tests, different files)

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
| Phase 6: Polish | T055–T057 | Final verification |
| **Total** | **57 tasks** | |

57 tasks across 6 phases. 18 marked parallel (`[P]`).
