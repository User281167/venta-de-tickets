# Feature Specification: User Tickets Page

**Feature Branch**: `009-user-tickets`

**Created**: 2026-07-10

**Status**: Draft

**Input**: "Add button and page schema for user tickets. Connect to backend API with TanStack for list all tickets that belong to him. Test it. Remove dead code or unnecessary old code."

## User Stories

### User Story 1 - User views their tickets (Priority: P1)

As a client, I want a "Mis Entradas" tab in the sidebar and a page listing all my tickets with their details so that I can see what I've purchased.

**Independent Test**: Navigate to `/mi-cuenta/entradas` → list of user's tickets displayed with ticket type name, code, status badge, purchase date.

**Acceptance Scenarios**:
1. **Given** an authenticated user with tickets, **When** they visit `/mi-cuenta/entradas`, **Then** a paginated list of tickets is displayed.
2. **Given** a ticket in the list, **When** rendered, **Then** it shows ticket type name, ticket code, status badge, and purchase date.
3. **Given** a user with no tickets, **When** they visit `/mi-cuenta/entradas`, **Then** "No tienes entradas registradas" is shown.
4. **Given** the sidebar, **When** user clicks "Mis Entradas", **Then** the tickets page is displayed and tab is highlighted.

---

### User Story 2 - Tests (Priority: P2)

As a developer, I want schema validation tests and UI component tests with mock data.

**Independent Test**: Run test suite — ticket schema tests pass, TicketList renders with mock data.

---

### User Story 3 - Dead code removal (Priority: P2)

As a developer, I want to remove dead/unnecessary code so the codebase is clean.

**Independent Test**: No references to deleted features remain. TypeScript compiles without new errors.

## Requirements

- **FR-001**: Sidebar MUST have "Mis Entradas" link pointing to `/mi-cuenta/entradas`.
- **FR-002**: Tickets page MUST fetch from `GET /api/me/tickets` with pagination.
- **FR-003**: Each ticket MUST show: ticket type name, ticket code, status badge (color-coded), purchase date.
- **FR-004**: Loading state MUST show skeleton. Empty state MUST show message. Errors MUST show toast.
- **FR-005**: `features/surveys/` directory MUST be deleted if exists.
- **FR-006**: `/admin/encuestas` link MUST be removed from AdminSidebar.
