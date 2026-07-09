# Feature Specification: Tickets Management

**Feature Branch**: `010-create-endpoints-tickets`

**Created**: 2026-07-09

**Status**: Draft

**Input**: User description: "create endpoints for tickets management only tickets type, functional requirements only admin can do add a new one, modify data (if set quanitity new value cannot be lower than current solds), enable disable and block only block is no retuned in list and cannot be buy, disable is returned but cannot be buy, list tickets can be done by everyone ever if no auth or has role, endpoint for get one by id, list with page limits, only admin role can modify and create, everyelse can list, validator price over 0, quantities over 0, and strong validators"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin manages ticket types (Priority: P1)

Platform admin creates, edits, and controls ticket type lifecycle (enable, disable, block). Each ticket type has price and quantity; quantity cannot drop below tickets already sold.

**Why this priority**: Core administrative functionality — ticket types must exist before anyone can list or buy them.

**Independent Test**: Admin can create a ticket type with valid data, verify it appears in listings, then modify price/quantity, and toggle status between enabled, disabled, and blocked.

**Acceptance Scenarios**:

1. **Given** admin is authenticated with admin role, **When** admin creates a ticket type with name, price > 0, and quantity > 0, **Then** ticket type is created in enabled status and returned with a unique identifier
2. **Given** an existing ticket type with 50 sold tickets, **When** admin sets quantity to 30, **Then** modification is rejected with error: "Quantity cannot be lower than current sold tickets (50)"
3. **Given** an existing ticket type with 50 sold tickets, **When** admin sets quantity to 100, **Then** modification succeeds and quantity updates to 100
4. **Given** an existing enabled ticket type, **When** admin disables it, **Then** ticket type still appears in listings but cannot be purchased
5. **Given** an existing disabled ticket type, **When** admin enables it, **Then** ticket type can be purchased again
6. **Given** an existing ticket type, **When** admin blocks it, **Then** ticket type no longer appears in any listing and cannot be purchased

---

### User Story 2 - Anyone browses ticket types (Priority: P1)

Any visitor — authenticated or not, any role — can list ticket types with pagination and view a single ticket type by ID.

**Why this priority**: Public ticket catalogue is essential for event attendance.

**Independent Test**: Unauthenticated user fetches paginated ticket type list and gets a single ticket type by ID.

**Acceptance Scenarios**:

1. **Given** multiple ticket types exist (some enabled, some disabled, some blocked), **When** any user requests the ticket list, **Then** response includes only enabled and disabled ticket types (excludes blocked) with pagination metadata
2. **Given** a valid ticket type ID, **When** any user requests that ticket type, **Then** ticket type data is returned (whether enabled or disabled)
3. **Given** a blocked ticket type ID, **When** any user requests that ticket type by ID, **Then** the ticket type is returned
4. **Given** no authentication, **When** user requests the ticket list, **Then** response is identical to authenticated listing

---

### User Story 3 - Authenticated non-admin user browses tickets (Priority: P2)

Users with non-admin roles can browse ticket types same as unauthenticated visitors.

**Why this priority**: Ensures consistent read access regardless of authentication status.

**Independent Test**: Authenticated non-admin user fetches paginated list successfully.

**Acceptance Scenarios**:

1. **Given** an authenticated user without admin role, **When** user requests ticket list, **Then** response is same as public listing
2. **Given** an authenticated user without admin role, **When** user tries to create a ticket type, **Then** operation is rejected with authorization error
3. **Given** an authenticated user without admin role, **When** user tries to modify or change ticket type status, **Then** operation is rejected with authorization error

---

### User Story 4 - Admin sees all ticket types including blocked (Priority: P2)

Admin needs visibility into blocked ticket types for management purposes.

**Why this priority**: Admin operational capability; blocked items still need to be discoverable.

**Independent Test**: Admin fetches ticket type list and sees blocked items included.

**Acceptance Scenarios**:

1. **Given** admin is authenticated with admin role, **When** admin requests ticket type list, **Then** response includes all states (enabled, disabled, and blocked) with pagination

---

### Edge Cases

- What happens when price is set to 0 or negative? System rejects with validation error.
- What happens when quantity is set to 0 or negative? System rejects with validation error.
- What happens when modifying non-existent ticket type? System returns not-found error.
- What happens when an unauthenticated user tries to access admin-only endpoints? System returns authorization error.
- What happens when disabling an already disabled ticket type? System accepts (idempotent) or returns current state.
- What happens when blocking an already blocked ticket type? System accepts (idempotent) or returns current state.
- What happens when listing with page number beyond available pages? System returns empty list with pagination metadata indicating last page.
- What happens with negative page numbers or page sizes exceeding maximum? System returns validation error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow admin users to create a ticket type with name, price (must be > 0), quantity (must be > 0), and any additional descriptive fields
- **FR-002**: System MUST reject ticket type creation with price ≤ 0 or quantity ≤ 0
- **FR-003**: System MUST allow admin users to modify ticket type fields (name, price, quantity, description)
- **FR-004**: System MUST reject quantity modification if new value is lower than current number of tickets sold for that type
- **FR-005**: System MUST provide three ticket type statuses: enabled, disabled, blocked
- **FR-006**: System MUST allow admin users to change ticket type status: enable, disable, or block
- **FR-007**: System MUST exclude blocked ticket types from public listing responses
- **FR-008**: System MUST include disabled ticket types in public listing but prevent their purchase
- **FR-009**: System MUST allow any user (authenticated or not, any role) to retrieve a paginated list of ticket types
- **FR-010**: System MUST allow any user (authenticated or not, any role) to retrieve a single ticket type by its ID
- **FR-011**: System MUST reject all create, modify, and status-change operations from non-admin users with an authorization error
- **FR-012**: System MUST validate price > 0 and quantity > 0 with clear, descriptive error messages
- **FR-013**: System MUST return pagination metadata (current page, total pages, total items, page size) in list responses
- **FR-014**: System MUST enforce a maximum page size limit and a default page size
- **FR-015**: System MUST generate a unique identifier for each created ticket type

### Key Entities *(include if feature involves data)*

- **Ticket Type**: Represents a category of ticket (e.g., General, VIP). Attributes include: unique identifier, name, description, price, total quantity, sold count, status (enabled / disabled / blocked), creation timestamp, last modification timestamp.
- **Sold Count**: Running counter of how many tickets of this type have been sold. Used to enforce the constraint that quantity cannot be reduced below this number.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can create, modify, and change status of a ticket type with all validations enforced in under 30 seconds end-to-end
- **SC-002**: Any user can retrieve paginated ticket type list with response delivered in under 2 seconds (with up to 100 ticket types)
- **SC-003**: 100% of validation failures (price ≤ 0, quantity ≤ 0, quantity < sold count) return clear, actionable error messages
- **SC-004**: Zero cases of data inconsistency where sold count exceeds total quantity for any ticket type
- **SC-005**: Non-admin users receive authorization errors on all mutation attempts with no data leakage

## Assumptions

- Newly created ticket types default to enabled status
- Ticket types represent event-agnostic categories (event association is out of scope for this feature)
- Standard web API patterns are used: JSON request/response bodies, HTTP status codes for success/failure
- Pagination uses page-number/page-size model with a reasonable default page size (e.g., 20) and a maximum page size (e.g., 100)
- Blocked ticket types are visible to admin in admin-specific listing but hidden from public listing
- Blocked ticket types are still retrievable by ID for all users (for reference purposes) but cannot be purchased
- "Strong validators" means server-side validation of all input constraints with descriptive error messages
