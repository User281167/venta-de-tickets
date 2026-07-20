# Feature Specification: Check-in and Remote Confirmation

**Feature Branch**: `017-checkin-confirmation`

**Created**: 2026-07-20

**Status**: Draft

**Input**: User description: "Check-in module for event entry with QR validation and remote buyer confirmation"

## User Scenarios & Testing

### User Story 1 — Direct entry at the door (Priority: P1)

An event attendee arrives at the venue and presents their QR code. The checker scans the QR, sees the ticket is valid and the attendee is the buyer, and confirms entry directly. The attendee enters the venue.

**Why this priority**: This is the most common flow — the majority of attendees are the original buyers.

**Independent Test**: Can be tested by scanning a QR for a ticket in `paid` state and confirming entry. The ticket must transition to `used` and show check-in time.

**Acceptance Scenarios**:

1. **Given** a ticket with status `paid`, **When** the checker scans the QR code, **Then** the system returns ticket details and `confirm_entry_direct` as an allowed action
2. **Given** the checker selects confirm entry, **When** the system processes the request, **Then** the ticket status changes to `used` and a check-in timestamp is recorded
3. **Given** a ticket that is already `used`, **When** the checker scans the QR code, **Then** the system reports that the ticket was already used and shows the check-in time
4. **Given** a ticket with status `cancelled` or `expired`, **When** the checker scans the QR code, **Then** the system reports the terminal state and no actions are offered

---

### User Story 2 — Remote confirmation (Priority: P1)

A buyer purchased multiple tickets for friends. The friends arrive first with the QR codes. The checker scans a QR, sees the buyer is not present, and sends a confirmation request to the buyer. The buyer receives a message with a link, clicks confirm. The checker sees the ticket is now confirmed and allows entry.

**Why this priority**: Remote confirmation is the key differentiator of this feature — it solves the real-world problem of ticket transfers without requiring the buyer to be present.

**Independent Test**: Can be tested by scanning a QR for a `paid` ticket, requesting confirmation, and having the buyer confirm via the link. The checker then allows entry.

**Acceptance Scenarios**:

1. **Given** a ticket with status `paid`, **When** the checker requests remote confirmation, **Then** the ticket status changes to `pending_confirmation` and a notification is sent to the buyer
2. **Given** the buyer receives the confirmation link, **When** they click confirm, **Then** the ticket status changes to `confirmed`
3. **Given** a ticket with status `confirmed`, **When** the checker scans the QR again, **Then** the system returns ticket details and `allow_entry` as an allowed action
4. **Given** the checker selects allow entry, **When** the system processes the request, **Then** the ticket status changes to `used`

---

### User Story 3 — Buyer rejects entry (Priority: P2)

A buyer receives a confirmation request but does not recognize the person at the door. The buyer clicks reject. The ticket returns to available state, and the checker can proceed with the next attendee.

**Why this priority**: This is an important security safeguard but is less frequent than the confirm flow.

**Independent Test**: Can be tested by requesting confirmation, then having the buyer reject. The ticket must return to `paid` state.

**Acceptance Scenarios**:

1. **Given** a ticket with status `pending_confirmation`, **When** the buyer clicks reject via the confirmation link, **Then** the ticket status returns to `paid`
2. **Given** a ticket that was rejected and returned to `paid`, **When** the checker scans the QR, **Then** the ticket is available for a new confirmation request or direct entry

---

### User Story 4 — Expired or invalid token (Priority: P3)

A buyer clicks the confirmation link after 30 minutes. The system informs them the link has expired. If the ticket is still pending, they can ask the checker to send a new request.

**Why this priority**: Token expiry is an edge case that affects a small percentage of users but is important for security.

**Independent Test**: Can be tested by using an expired or tampered token and verifying the system rejects it.

**Acceptance Scenarios**:

1. **Given** an expired confirmation token, **When** the buyer clicks the link and submits it, **Then** the system returns an invalid token error
2. **Given** a tampered or malformed token, **When** submitted, **Then** the system returns an invalid token error

---

### Edge Cases

- **Concurrent checkers**: Two checkers scan the same ticket at the same time. The first to confirm entry succeeds; the second receives a conflict error indicating the ticket was already processed.
- **QR does not decode**: The scanned QR contains invalid data or is not a valid ticket token. The system informs the checker with an appropriate message.
- **Ticket not found**: The QR decodes successfully but the ticket identifier does not match any ticket in the system.
- **Buyer never responds**: The confirmation token expires after 30 minutes and the ticket remains in `pending_confirmation`. The checker must handle this by coordinating with the attendee (out of system scope — a cleanup sweep may be added later).
- **Buyer rejects while checker still waiting**: The checker sees the ticket returned to `paid` on next scan, allowing re-processing.
- **Multiple re-requests**: If the token expires without buyer action, the checker can request confirmation again (the ticket resets its state accordingly).

## Requirements

### Functional Requirements

- **FR-001**: Checkers must be able to scan a QR code on a ticket and see its current status, event name, attendee name, and any actions they can take
- **FR-002**: The system must allow checkers to confirm entry directly when the ticket buyer is present and the ticket is in `paid` status
- **FR-003**: The system must allow checkers to request remote confirmation when the ticket buyer is not present and the ticket is in `paid` status
- **FR-004**: When a checker requests remote confirmation, the system must send a notification to the buyer with a secure link to confirm or reject
- **FR-005**: Buyers must be able to confirm entry authorization via a secure link, changing the ticket to `confirmed` status
- **FR-006**: Buyers must be able to reject entry authorization via a secure link, returning the ticket to `paid` status
- **FR-007**: The system must allow checkers to allow entry for tickets in `confirmed` status, changing them to `used`
- **FR-008**: The system must prevent two checkers from processing the same ticket simultaneously — only the first request should succeed
- **FR-009**: The system must reject invalid, tampered, or expired confirmation tokens with a clear error message
- **FR-010**: The system must protect against unauthorized access — only authenticated checkers and admins can perform check-in operations
- **FR-011**: The system must handle tickets in terminal states (`used`, `cancelled`, `expired`, `reserved`) by informing the checker without offering actions
- **FR-012**: The system must guarantee that scanning a QR is a read-only, idempotent operation that can be repeated safely without side effects

### Key Entities

- **Ticket**: Represents a single entry pass with a unique QR identifier. Tracks its current status (`paid`, `pending_confirmation`, `confirmed`, `used`, etc.), associated event, and buyer. A single purchase can have multiple tickets for multiple attendees.
- **Check-in Record**: The event of a ticket being scanned and marked as `used`. Records when and by which checker the entry was confirmed.
- **Confirmation Request**: The action initiated by a checker to ask a buyer for remote authorization. Creates a secure token sent to the buyer and tracks the pending confirmation state.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Checkers can complete a direct entry scan-and-confirm in under 10 seconds from scan to confirmation
- **SC-002**: The scan operation returns results in under 2 seconds even during peak event load
- **SC-003**: Remote confirmation requests reach the buyer within 1 minute of the checker requesting it
- **SC-004**: Buyers can complete the confirm or reject action in under 30 seconds from opening the link
- **SC-005**: The system handles concurrent scans from multiple checkers at the same event without data corruption or inconsistent states
- **SC-006**: Support staff receive zero tickets related to "double entry" or "wrong person entered" caused by race conditions
- **SC-007**: 99% of confirmation requests with valid tokens resolve (confirm or reject) without errors

## Assumptions

- Checkers have access to a scanning device (phone or tablet) with internet connectivity
- Buyers have access to email or WhatsApp on their mobile device to receive and act on confirmation links
- Confirmation links expire after 30 minutes; tickets can be re-requested if no response
- The messaging system for sending confirmation requests to buyers is provided by the existing notifications module
- QR codes are already generated by the existing tickets module and printed or displayed by attendees
- Checkers are authenticated users with the `checker` or `admin` role
- Buyers do not need a user account or session to confirm/reject — they are authenticated only by the token in the link
- The feature does not include batch operations — each ticket is processed individually
- This spec covers backend logic only; the confirmation page UI that buyers see is handled by the frontend