# Feature Specification: Admin Payments Manager

**Feature Branch**: `013-admin-payments-manager`

**Created**: 2026-07-12

**Status**: Draft

**Input**: User description: "Create admin checkouts payment manager"

## User Scenarios & Testing

### User Story 1 — View and filter payment list (Priority: P1)

Admin navigates to payments section, sees paginated list of all transactions. Filters by status (pending, approved, rejected, refunded), date range, or searches by user email or event name.

**Why this priority**: Core view — admin cannot manage payments without seeing them first.

**Independent Test**: Admin loads payment list page, verifies rows appear with correct columns (date, user, event, amount, status). Apply filter and verify list narrows. Covers all CRUD read operations.

**Acceptance Scenarios**:

1. **Given** an authenticated admin user, **When** they navigate to the payments page, **Then** they see a paginated table of payments ordered by most recent first.
2. **Given** the payment list page, **When** the admin enters a date range filter, **Then** only payments within that range are displayed.
3. **Given** the payment list page, **When** the admin selects a status filter (e.g. "refunded"), **Then** only payments with that status are displayed.
4. **Given** the payment list page, **When** the admin types a search term matching a user email or event name, **Then** matching payments are shown.

---

### User Story 2 — View payment detail (Priority: P1)

Admin clicks a payment row and sees full detail: user info, event/tickets purchased, amount, payment method, status history, and any refunds applied.

**Why this priority**: Admin needs full context before taking action (refund, investigate issues).

**Independent Test**: Admin clicks a payment row, detail panel or page opens with all fields populated correctly.

**Acceptance Scenarios**:

1. **Given** the payment list, **When** the admin clicks a payment row, **Then** a detail view shows the payment amount, status, date, user name and email, event name, and ticket list.
2. **Given** the payment detail view, **When** the payment has refunds, **Then** each refund entry (amount, date, reason, status) is displayed.

---

### User Story 3 — Process refund (Priority: P2)

Admin initiates a full or partial refund from the payment detail view. Enters refund reason, confirms, and system processes the refund. Refund status reflected in payment history.

**Why this priority**: Refunds are a common admin task but not required for initial read-only release.

**Independent Test**: Admin clicks "Refund" on a completed payment, enters amount and reason, confirms. Payment status updates to refunded/partially_refunded. Refund record appears in detail history.

**Acceptance Scenarios**:

1. **Given** a completed payment, **When** the admin initiates a refund with a valid amount and reason, **Then** the refund is processed and the payment status updates accordingly.
2. **Given** a completed payment, **When** the admin initiates a partial refund (amount less than total), **Then** the payment status becomes "partially_refunded".
3. **Given** a payment already fully refunded, **When** the admin attempts another refund, **Then** the system shows an error indicating no remaining balance.
4. **Given** the refund form, **When** the admin submits without a reason, **Then** the system requires a reason before proceeding.

---

### User Story 4 — Export payment report (Priority: P3)

Admin exports filtered payment list as CSV/XLSX for external reporting or reconciliation.

**Why this priority**: Useful but not critical — manual alternative exists (copy from screen).

**Independent Test**: Admin applies filters, clicks Export, and downloads a file with matching data.

**Acceptance Scenarios**:

1. **Given** filtered payment results, **When** the admin clicks Export, **Then** a file download begins containing all visible columns and rows matching current filters.
2. **Given** the export action, **When** there are more results than the current page, **Then** the export includes all matching results (not just current page).

---

### Edge Cases

- What happens when the payment gateway is unreachable during a refund request?
- How does the system handle a payment that was already refunded externally (out of band)?
- What happens when two admins try to refund the same payment simultaneously?
- How are payments with pending status displayed (incomplete checkout)?
- What happens when the user who made the payment no longer exists in the system?
- How does the system display payments for deleted events?

## Requirements

### Functional Requirements

- **FR-001**: System MUST display a paginated list of all payments with columns: date, user name, user email, event name, ticket count, total amount, payment status.
- **FR-002**: System MUST allow filtering payments by status, date range, and free-text search (user email or event name).
- **FR-003**: System MUST display payment detail including: user info, event info, purchased tickets (type, quantity, unit price), total amount, payment method, payment gateway transaction ID, status, and timestamp.
- **FR-004**: System MUST allow admin to initiate a full or partial refund from the payment detail view.
- **FR-005**: System MUST require a refund reason before processing a refund.
- **FR-006**: System MUST update payment status to "refunded" or "partially_refunded" after successful refund.
- **FR-007**: System MUST record refund history entries with: amount, reason, processed by (admin), timestamp, and status.
- **FR-008**: System MUST prevent refunding more than the remaining available balance on a payment.
- **FR-009**: System MUST handle payment gateway errors during refund gracefully and display an appropriate error message.
- **FR-010**: System MUST allow exporting filtered payment results as a downloadable file.
- **FR-011**: System MUST restrict access to the payments management section to super_admin and admin roles.
- **FR-012**: System MUST show a loading state while payment data is being fetched.
- **FR-013**: System MUST show an empty state when no payments match the current filters.

### Key Entities

- **Payment**: Represents a completed or attempted ticket purchase transaction. Contains total amount, status (pending, approved, rejected, refunded, partially_refunded, charged_back), payment method info, gateway transaction ID, timestamps, and links to the purchasing user and the event.
- **Refund**: Represents a refund issued against a payment. Contains amount, reason, processed-by admin, timestamp, and status. Multiple refunds can exist per payment.
- **Payment Item**: Individual line item within a payment — maps to a specific ticket type and quantity purchased.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Admin can locate any payment by user email or event name within 3 actions (navigate, search, view).
- **SC-002**: Payment list page loads initial results in under 2 seconds for up to 10,000 payments.
- **SC-003**: Refund processing completes end-to-end in under 5 seconds for 95% of requests.
- **SC-004**: Admin successfully completes refund task on first attempt without needing support documentation.
- **SC-005**: Export of up to 10,000 payment records completes in under 10 seconds.

## Assumptions

- Existing authentication and authorization system reused (admin/super_admin roles).
- Payment gateway (Mercado Pago) integration already exists for processing payments — refunds will use the same gateway API.
- Payment records already exist in the database from the ticket checkout flow.
- The refund feature requires integration with the payment gateway to process actual refunds (not just recording them locally).
- Export format defaults to CSV for v1; XLSX is a future enhancement.
- Mobile responsiveness is not a v1 requirement for this admin interface.
