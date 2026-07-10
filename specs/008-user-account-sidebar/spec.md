# Feature Specification: User Account Sidebar & Payments

**Feature Branch**: `008-user-account-sidebar`

**Created**: 2026-07-10

**Status**: Draft

**Input**: "Create sidebar for user items 'Información', 'Pagos'. Connect and get user payments, list them can be dropdowns, main info on header detail info in content. Test schemas validator and simple UI render components with mock data."

## User Stories

### User Story 1 - User sidebar with tab navigation (Priority: P1)

As a client, I want a sidebar in `/mi-cuenta` with "Información" and "Pagos" tabs so that I can navigate between my profile info and payment history.

**Why this priority**: Foundation — sidebar layout is prerequisite for the payments page.

**Independent Test**: Navigate to `/mi-cuenta`, sidebar shows "Información" and "Pagos". Click "Pagos" → URL changes to `/mi-cuenta/pagos`. Click "Información" → shows ProfileForm content.

**Acceptance Scenarios**:
1. **Given** an authenticated user at `/mi-cuenta`, **When** the page loads, **Then** a sidebar is visible on the left with "Información" and "Pagos" links.
2. **Given** the sidebar, **When** user clicks "Información", **Then** the ProfileForm is displayed in the content area.
3. **Given** the sidebar, **When** user clicks "Pagos", **Then** the payment history section is displayed.
4. **Given** the sidebar, **When** a tab is active, **Then** it is visually highlighted.
5. **Given** mobile viewport, **When** sidebar is shown, **Then** it is responsive (collapsible or top tabs).

---

### User Story 2 - Payment history with dropdown detail (Priority: P1)

As a client, I want to see my payment history with expandable rows showing main info on top and detail (tickets, amounts) inside so that I can review past purchases.

**Why this priority**: Core value — user can see their purchase history.

**Independent Test**: Authenticated user with payments navigates to `/mi-cuenta/pagos`. A list of payments is displayed showing date, amount, provider, status. Clicking a row expands to show associated tickets.

**Acceptance Scenarios**:
1. **Given** an authenticated user with payments, **When** they visit `/mi-cuenta/pagos`, **Then** a paginated list of payments is displayed with date, amount (formatted COP), provider, and status for each.
2. **Given** a payment in the list, **When** user clicks/taps the row, **Then** it expands to show associated tickets (code, status) and payment detail.
3. **Given** a payment in the list, **When** user clicks/taps again, **Then** it collapses.
4. **Given** a user with no payments, **When** they visit `/mi-cuenta/pagos`, **Then** a message "No hay pagos registrados" is shown.
5. **Given** the payments list, **When** there are more than 20 payments, **Then** pagination controls appear.

---

### User Story 3 - Tests for schemas and UI components (Priority: P2)

As a developer, I want schema validation tests and UI component tests with mock data so that payments feature is verified independently of the live server.

**Why this priority**: Quality assurance — ensures refactored code is reliable.

**Independent Test**: Run test suite without a running server — payment schema tests pass, PaymentList component renders with mock data showing all states (loading, empty, with data, error).

**Acceptance Scenarios**:
1. **Given** a payment schema, **When** valid payment data is parsed, **Then** validation passes.
2. **Given** a payment schema, **When** invalid data is parsed, **Then** validation fails with appropriate message.
3. **Given** the PaymentList component rendered with mock payments, **When** it mounts, **Then** all payment rows are displayed with correct data.
4. **Given** the PaymentList component, **When** mock data has 0 payments, **Then** empty state message is shown.
5. **Given** the PaymentList component, **When** mock data includes a payment with tickets, **Then** expanding the row shows ticket details.

### Edge Cases

- What happens if the payments API returns an error (network failure, 500)?
- How does the sidebar behave on mobile (small screens)?
- What happens if a payment has no associated tickets?
- How are different payment statuses (pending, completed, failed, refunded) displayed visually?
- What happens when the user navigates directly to `/mi-cuenta/pagos` without visiting `/mi-cuenta` first?

## Requirements

### Functional Requirements

- **FR-001**: System MUST display a sidebar navigation in `/mi-cuenta` with at least "Información" and "Pagos" links.
- **FR-002**: "Información" MUST show the existing ProfileForm component.
- **FR-003**: "Pagos" MUST fetch data from `GET /api/me/payments` and display a paginated list.
- **FR-004**: Each payment row MUST show: date, amount (COP format), provider name, and status badge.
- **FR-005**: Clicking a payment row MUST expand to show associated tickets and full details.
- **FR-006**: Empty state MUST display "No hay pagos registrados" when user has no payments.
- **FR-007**: Loading state MUST show a skeleton while fetching.
- **FR-008**: Error state MUST show a toast with the error message.
- **FR-009**: Pagination MUST be supported for payments with >20 items.
- **FR-010**: Tests MUST cover payment schema validation and PaymentList component rendering with mock data.

### Key Entities

- **UserSidebar**: Navigation component for `/mi-cuenta` with tabs.
- **PaymentList**: Component that fetches and displays payments with expandable rows.
- **PaymentSchema**: Zod schema for payment data validation on frontend.
- **MockPaymentFactory**: Utility to generate mock payment data for tests.

## Success Criteria

- **SC-001**: Sidebar renders correctly on desktop and mobile.
- **SC-002**: Payment list fetches and displays data from backend endpoint.
- **SC-003**: Expandable rows show correct ticket details.
- **SC-004**: All payment statuses display with appropriate colors/badges.
- **SC-005**: Test suite passes with 100% of schema and UI component tests.

## Assumptions

- Backend `GET /api/me/payments` endpoint is already implemented and working.
- Payment response shape matches `{ data: PaymentItem[], total: number, page: number, limit: number }`.
- Each PaymentItem includes tickets array for the expandable detail.
- ProfileForm component exists and is working.
- Sidebar design follows existing AdminSidebar as reference.
