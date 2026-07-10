---
description: "Build user account sidebar with Información/Pagos tabs, payment history with expandable rows, and tests"
---

# Tasks: User Account Sidebar & Payments

**Input**: Create sidebar for /mi-cuenta with "Información" and "Pagos" tabs, connect GET /api/me/payments, list with expandable rows, test schemas + UI with mock data.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3)
- Include exact file paths

---

## Phase 1: Setup — Frontend payments module structure

**Purpose**: Create the module directory structure for the new payments feature.

- [X] T001 Create `frontend/app/(protected)/mi-cuenta/pagos/page.tsx` — route page that renders PaymentList client component
- [X] T002 Create directory `frontend/features/users/types/` if missing

---

## Phase 2: User Story 1 — Sidebar with tab navigation (P1) 🎯 MVP

**Goal**: User sees sidebar with Información/Pagos tabs; clicking switches content.

**Independent Test**: Navigate to `/mi-cuenta`, sidebar visible with both tabs. Click each tab → correct content renders. Active tab highlighted.

### Implementation

- [X] T003 [US1] Create `frontend/features/users/components/UserSidebar.tsx` — sidebar with "Información" (`/mi-cuenta`) and "Pagos" (`/mi-cuenta/pagos`) links using NextLink + usePathname for active state. Mobile responsive (hamburger drawer), desktop fixed left panel.
- [X] T004 [US1] Create `frontend/app/(protected)/mi-cuenta/layout.tsx` — client component. Flex layout with UserSidebar on left + content area on right. Move auth loading + consent check from page.tsx here.
- [X] T005 [US1] Update `frontend/app/(protected)/mi-cuenta/page.tsx` — simplify to render only ProfileForm (layout handles sidebar + loading + consent).

**Checkpoint**: `/mi-cuenta` shows sidebar + ProfileForm. `/mi-cuenta/pagos` shows sidebar (placeholder content for now).

---

## Phase 3: User Story 2 — Payment history with expandable rows (P1)

**Goal**: Payment list fetched from API, displayed with expandable rows showing header info + ticket details.

**Independent Test**: Authenticated user with payments visits `/mi-cuenta/pagos` → list of payments with date, amount, status. Click row → expands to show tickets.

### Implementation

- [X] T006 [US2] Create payment types in `frontend/features/users/types/payment.types.ts` — `PaymentStatus`, `PaymentItem`, `TicketSummary`, `PaymentListResponse` matching backend `selectPaymentHistory` response.
- [X] T007 [US2] Create payment schema in `frontend/features/users/schemas/payment.schema.ts` — Zod schemas for `paymentItemSchema`, `paymentListResponseSchema`.
- [X] T008 [US2] Create payments API client in `frontend/features/users/api/payments.client.ts` — `fetchMyPayments(page, limit)` calling `GET /api/me/payments?page=X&limit=Y` using existing apiFetch pattern from users.client.ts.
- [X] T009 [US2] Create `frontend/features/users/hooks/usePayments.ts` — TanStack Query hook `useMyPayments(page, limit)` calling `fetchMyPayments`.
- [X] T010 [US2] Create `frontend/features/users/components/PaymentRow.tsx` — expandable row: header shows date (es-CO locale), amount (COP format), provider, status badge (green=completed, yellow=pending, red=failed, gray=refunded). Click toggles detail.
- [X] T011 [US2] Create `frontend/features/users/components/PaymentList.tsx` — fetches via `useMyPayments`, renders list of PaymentRow. Loading skeleton, empty "No hay pagos registrados", error toast. Pagination at bottom.
- [X] T012 [US2] Create `frontend/features/users/components/PaymentDetail.tsx` — expanded content: tickets (code, status), payment ID, dates.

**Checkpoint**: `/mi-cuenta/pagos` shows working payment list with expandable rows.

---

## Phase 4: User Story 3 — Tests (P2)

**Goal**: Schema validation tests + PaymentList component renders with mock data.

**Independent Test**: Run `npx vitest run` — payment schema tests pass, PaymentList renders with mock data showing all states.

### Tests

- [X] T013 [P] [US3] Create payment schema tests in `frontend/features/users/schemas/__tests__/payment.schema.test.ts` — valid/invalid status, missing fields, pagination params.
- [X] T014 [P] [US3] Create mock payment data factory in `frontend/features/users/components/__tests__/mock-payments.ts` — `createMockPayment(overrides?)`, `createMockPaymentList(count, overrides?)`.
- [X] T015 [P] [US3] Create PaymentList render test in `frontend/features/users/components/__tests__/PaymentList.test.tsx` — loading, empty, data, error states.

**Checkpoint**: All payment tests pass.

---

## Dependencies & Execution Order

- **Phase 1 (Setup)**: No dependencies — can start immediately.
- **Phase 2 (US1 — Sidebar)**: Depends on Phase 1.
- **Phase 3 (US2 — Payments)**: Depends on Phase 1. Sidebar structure from US2 handles route, but payment list implementation is independent of US1 specifics.
- **Phase 4 (US3 — Tests)**: Depends on Phase 3 (schemas + components must exist to test).

### Parallel Opportunities

- T001 and T002 (setup) — parallel.
- T006, T007, T008 (types, schema, api client) — all independent, parallel.
- T010, T011, T012 (components) — sequential (PaymentRow → PaymentList → PaymentDetail).
- T013, T014, T015 (tests) — all independent, parallel.

---

## Parallel Example

```bash
# Phase 3 — types + schema + api client are independent:
Task: "T006 Create payment types"
Task: "T007 Create payment schema"
Task: "T008 Create payments API client"

# Phase 4 — all tests are independent:
Task: "T013 Payment schema tests"
Task: "T014 Mock data factory"
Task: "T015 PaymentList render test"
```

---

## Implementation Strategy

1. **Setup (Phase 1)**: Create directory structure + route page.
2. **Sidebar layout (US1 — Phase 2)**: Convert `/mi-cuenta` to layout with sidebar. This enables routing for the payments page.
3. **Payment list (US2 — Phase 3)**: Build bottom-up: types → schema → api client → hook → PaymentRow → PaymentDetail → PaymentList.
4. **Tests (US3 — Phase 4)**: Schema validation tests first, then mock data, then component render tests.

## Key Files

| File | Role |
|------|------|
| `frontend/shared/components/UserSidebar.tsx` | Sidebar with Información/Pagos tabs |
| `frontend/app/(protected)/mi-cuenta/layout.tsx` | Layout with sidebar + content |
| `frontend/app/(protected)/mi-cuenta/page.tsx` | Simplified — only ProfileForm |
| `frontend/app/(protected)/mi-cuenta/pagos/page.tsx` | Payments route page |
| `frontend/features/payments/types/payment.types.ts` | Payment type definitions |
| `frontend/features/payments/schemas/payment.schema.ts` | Payment Zod schemas |
| `frontend/features/payments/api/payments.client.ts` | API fetch for payments |
| `frontend/features/payments/hooks/usePayments.ts` | TanStack Query hook |
| `frontend/features/payments/components/PaymentRow.tsx` | Expandable row |
| `frontend/features/payments/components/PaymentList.tsx` | Payment list with states |
| `frontend/features/payments/components/PaymentDetail.tsx` | Expanded detail content |
| `frontend/features/payments/schemas/__tests__/payment.schema.test.ts` | Schema tests |
| `frontend/features/payments/components/__tests__/mock-payments.ts` | Mock data factory |
| `frontend/features/payments/components/__tests__/PaymentList.test.tsx` | Component render tests |
