# Feature Specification: Ticketing

**Feature Branch**: `008-ticketing`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "Ticketing system: schema + seed, ticket types admin, public event page, reservation flow"

## User Scenarios & Testing

### User Story 1 - Public Event Browsing (Priority: P1)

A visitor opens the public event page without logging in. They see the event details (name, date, location) and a list of available ticket types with live availability counts. Sold-out types display "Agotado" and are disabled but remain visible. The visitor can browse all information without authentication.

**Why this priority**: Core value proposition — without a browsable event page, no tickets can be sold. This is the foundation for all downstream flows.

**Independent Test**: Load the public event page in an anonymous browser session. Verify event details render, ticket types list with availability counts, sold-out types show "Agotado" and cannot be clicked.

**Acceptance Scenarios**:

1. **Given** an active event with ticket types exists, **When** an anonymous user visits the event page, **Then** event details (name, date, location) and all active ticket types with live availability counts are displayed.
2. **Given** a ticket type has zero remaining quantity, **When** the user views the event page, **Then** the type shows "Agotado", is visually disabled, but remains visible in the list.
3. **Given** the user is not authenticated, **When** they click "Comprar" on any ticket type, **Then** they are redirected to `/login?returnUrl=<event-page>`.

---

### User Story 2 - Admin Ticket Type Management (Priority: P1)

An admin (super_admin or organizer) creates, edits, and deactivates ticket types from the admin panel. They can set name, price (in COP cents), total quantity, and active status. They can adjust quantity up or down. Deactivation hides the type from public view but preserves it if tickets exist.

**Why this priority**: Admins must be able to configure ticket inventory before any sales happen. Co-equal with P1 because the system has no ticket types without admin setup.

**Independent Test**: Log in as admin, create a ticket type with name/price/quantity, verify it appears on the public page. Edit price, verify update. Deactivate type with existing tickets, verify it's hidden from public but record persists.

**Acceptance Scenarios**:

1. **Given** an admin is authenticated, **When** they create a ticket type with name, price (COP cents), and total quantity, **Then** the type appears on the public event page with correct details.
2. **Given** a ticket type has existing reservations, **When** the admin deactivates it, **Then** the type is hidden from the public page but the record and associated tickets remain intact.
3. **Given** a ticket type exists, **When** the admin increases or decreases `total_quantity`, **Then** the public page reflects the new availability count without creating or deleting any ticket records.
4. **Given** a non-admin user, **When** they attempt to manage ticket types, **Then** access is denied.

---

### User Story 3 - Ticket Reservation (Priority: P1)

An authenticated user selects a ticket type and quantity (1–4), submits a reservation, and receives a unique ticket code and QR token. The reservation is held for 10 minutes. Concurrent requests for the last slot result in exactly one success and one 409 conflict.

**Why this priority**: The reservation flow is the core transaction — the entire system exists to enable this.

**Independent Test**: Log in, select a ticket type with sufficient availability, reserve 2 tickets, verify unique ticket codes (`FM26-XXXX` format) and QR tokens are returned. Attempt two simultaneous reservations for the last slot, verify one succeeds and one gets 409.

**Acceptance Scenarios**:

1. **Given** a user is authenticated and a ticket type has sufficient availability, **When** they reserve N tickets (1–4), **Then** N tickets are created with unique `ticket_code` values and signed `qr_token` values, status set to `reserved`, with a 10-minute expiration window.
2. **Given** a ticket type has 1 slot remaining, **When** two concurrent requests each try to reserve 1 ticket, **Then** exactly one request succeeds and the other receives a 409 Conflict response.
3. **Given** a user already holds an active reservation for the event, **When** they attempt another reservation, **Then** the request is rejected (one active reservation per event maximum).
4. **Given** a user requests more tickets than available, **When** they submit the reservation, **Then** a 409 Conflict response is returned.

---

### User Story 4 - Reservation Expiration (Priority: P2)

Stale reservations (not confirmed within 10 minutes) are automatically marked as expired by a background process running every 2 minutes. Expired tickets release their inventory back to the available count.

**Why this priority**: Prevents inventory lock-up from abandoned reservations. Important for availability but not blocking initial launch.

**Independent Test**: Create a reservation, wait 10+ minutes without confirming, verify ticket status changes to `expired` within a 2-minute window. Verify availability count increases after expiration.

**Acceptance Scenarios**:

1. **Given** a reservation has passed its 10-minute expiration, **When** the cleanup process runs, **Then** the ticket status is updated to `expired` within 2 minutes.
2. **Given** a ticket is marked `expired`, **When** a user views the public event page, **Then** the released quantity is reflected in the availability count.

---

### User Story 5 - Reservation Countdown Timer (Priority: P2)

After a successful reservation, the user sees a countdown timer showing remaining time before expiration. The timer is anchored to the server-provided expiration timestamp, not the client clock.

**Why this priority**: UX enhancement that reduces confusion about reservation deadlines. Not critical for core functionality.

**Independent Test**: Complete a reservation, verify countdown timer displays and counts down from ~10 minutes. Refresh the page, verify timer recalculates from server timestamp.

**Acceptance Scenarios**:

1. **Given** a user has a active reservation, **When** they view their reservation, **Then** a countdown timer displays remaining time until expiration, anchored to the server timestamp.
2. **Given** the user's device clock is incorrect, **When** they view the timer, **Then** the timer still shows correct remaining time based on server time.

---

### Edge Cases

- What happens when a user tries to reserve tickets for a deactivated ticket type? → Request rejected with clear error.
- What happens when the Postgres sequence reaches its max value? → Sequence wraps; `ticket_code` uniqueness enforced by DB constraint.
- What happens when the cron job runs while a reservation transaction is in progress? → `FOR UPDATE` row locking prevents conflict; cron skips locked rows.
- What happens when a user closes the browser during reservation? → Reservation expires after TTL, inventory released.
- What happens when two different users try to reserve the last ticket simultaneously? → Atomic transaction ensures exactly one succeeds.
- What happens when the event is deactivated? → Public page shows event as inactive; reservations blocked.

## Requirements

### Functional Requirements

- **FR-1**: System MUST allow `super_admin` and `organizer` roles to create, edit, and deactivate ticket types.
- **FR-2**: System MUST store ticket prices as integer values representing COP cents (no floating point).
- **FR-3**: System MUST prevent hard deletion of ticket types that have associated tickets; only deactivation is allowed.
- **FR-4**: System MUST allow admins to adjust `total_quantity` for ticket types without auto-creating or auto-deleting ticket records.
- **FR-5**: System MUST serve the public event page without requiring authentication.
- **FR-6**: System MUST display active ticket types with live `available_count` calculated as `total_quantity - COUNT(reserved/confirmed tickets)`.
- **FR-7**: System MUST show sold-out ticket types as "Agotado" (disabled, not hidden).
- **FR-8**: System MUST redirect unauthenticated users to `/login?returnUrl=...` when they click "Comprar".
- **FR-9**: System MUST expose `POST /api/tickets/reserve` accepting `{ ticket_type_id, quantity }` where quantity is 1–4.
- **FR-10**: System MUST execute reservations atomically using database transaction with row-level locking to prevent overselling under concurrency.
- **FR-11**: System MUST return 409 Conflict when requested quantity exceeds available inventory.
- **FR-12**: System MUST enforce one active reservation per user per event.
- **FR-13**: System MUST generate unique `ticket_code` in format `{event.prefix}-{4-digit-sequence}` for each reserved ticket.
- **FR-14**: System MUST generate a signed JWT `qr_token` for each ticket containing ticket code, event ID, user ID, and ticket type ID.
- **FR-15**: System MUST run a background cleanup process every 2 minutes to mark expired reservations.
- **FR-16**: System MUST provide a frontend countdown timer anchored to the server-provided `reserve_expires_at` timestamp.

### Key Entities

- **Event**: Represents a single event with name, date, location, and a prefix used for ticket code generation. One primary event seeded via database.
- **TicketType**: Defines a category of ticket with name, price (COP cents), total quantity, and active status. Admin-managed.
- **Ticket**: An individual ticket created at reservation time. Contains unique code, QR token, status (`reserved`/`confirmed`/`expired`/`cancelled`), and expiration timestamp. Links to event, ticket type, and user.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Admins can create a ticket type and see it appear on the public page within 5 seconds.
- **SC-002**: Two concurrent reservations for the last slot result in exactly one success — zero overselling.
- **SC-003**: Expired reservations are marked `expired` within 2 minutes of TTL expiration.
- **SC-004**: Ticket codes are unique across the system and human-readable (`FM26-XXXX` format).
- **SC-005**: QR tokens verify correctly with the signing secret and contain the correct ticket metadata.
- **SC-006**: No QR images are stored in the database or external storage at any point.
- **SC-007**: Public event page loads without authentication and displays live availability for all active ticket types.
- **SC-008**: Reservation countdown timer accurately reflects server-side expiration time regardless of client clock skew.

## Assumptions

- Single primary event model — the platform supports one event at a time, seeded via database migration.
- Existing authentication system is reused for user identity and role-based access.
- Colombian market — all prices in COP cents, Spanish UI labels ("Comprar", "Agotado").
- Payment processing is handled separately (Wompi integration, out of scope for this feature).
- QR image/PDF generation is a separate feature — this spec only generates the signed token.
- Check-in validation is a separate feature — this spec does not implement ticket scanning.
- Database supports `FOR UPDATE` row locking (PostgreSQL).
- 10-minute reservation TTL accommodates Wompi's redirect-based payment flow.
