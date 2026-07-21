# Feature Specification: Transactional Email Module

**Feature Branch**: `018-transactional-emails`

**Created**: 2026-07-21

**Status**: Draft

**Input**: User description: "Spec: Módulo `messaging` — transactional email via Resend for payment confirmed, ticket confirmed, and ticket cancelled notifications"

## User Scenarios & Testing

### User Story 1 - Buyer Receives Payment Confirmation Email (Priority: P1)

When a buyer's payment is approved (Mercado Pago webhook signals `paid`), they receive an email confirming the payment details.

**Why this priority**: Payment confirmation is the most critical notification — it assures the buyer their transaction succeeded and sets expectations for ticket delivery.

**Independent Test**: Can be fully tested by triggering a payment approval in a test environment and verifying the buyer receives an email with correct amount, event name, and date.

**Acceptance Scenarios**:

1. **Given** a buyer has completed a payment that is approved via Mercado Pago, **When** the payment status transitions to `paid`, **Then** the buyer receives an email with template `payment-confirmed` containing their name, the amount paid, the event name, and the payment date.
2. **Given** a payment approval email is sent, **When** the email is delivered, **Then** all monetary values display correctly formatted currency and the event name matches the purchased event.
3. **Given** the Resend API returns an error during email sending, **When** the system fails to deliver, **Then** the error is logged and the system continues without blocking the payment confirmation flow.

---

### User Story 2 - Buyer Receives Ticket Confirmation Email (Priority: P1)

When a ticket transitions from `pending_confirmation` to `confirmed`, the buyer receives an email with their ticket details and QR code.

**Why this priority**: The ticket with QR code is the access credential to the event — this is the primary delivery mechanism for the purchased asset.

**Independent Test**: Can be fully tested by confirming a ticket in the system and verifying the buyer receives an email with the QR image URL and ticket ID.

**Acceptance Scenarios**:

1. **Given** a ticket is in `pending_confirmation` status, **When** the ticket transitions to `confirmed`, **Then** the buyer receives an email with template `ticket-confirmed` containing their name, the event name, the QR image URL, and the ticket ID.
2. **Given** a ticket confirmation email is sent, **When** the email renders, **Then** the QR image URL is a valid, accessible URL pointing to the generated QR code.
3. **Given** the Resend API fails during ticket confirmation email delivery, **When** the error occurs, **Then** the error is logged and the ticket confirmation flow completes without disruption.

---

### User Story 3 - Buyer Receives Ticket Cancellation Email (Priority: P2)

When a ticket is cancelled (any status transitions to `cancelled`), the buyer receives a notification email.

**Why this priority**: Ticket cancellation is important for user trust but less frequent than confirmations; the buyer can also see cancellation status when logged into the platform.

**Independent Test**: Can be fully tested by cancelling a ticket in the system and verifying the buyer receives an email with the ticket ID and event name.

**Acceptance Scenarios**:

1. **Given** a confirmed or pending ticket exists, **When** the ticket status changes to `cancelled`, **Then** the buyer receives an email with template `ticket-cancelled` containing their name, the event name, and the ticket ID.
2. **Given** a cancellation email is sent, **When** the email is delivered, **Then** it clearly communicates that the ticket is no longer valid.
3. **Given** a ticket is cancelled but the email fails to send, **When** the API errors, **Then** the error is logged and the ticket cancellation proceeds without blocking.

---

### Edge Cases

- What happens when the buyer's email address is invalid or missing?
- How does the system handle concurrent status transitions (e.g., payment approved and ticket confirmed in quick succession)?
- What happens when an email template variable is missing or null (e.g., missing customer name)?
- How does the system behave when Resend rate limits are exceeded?

## Requirements

### Functional Requirements

- **FR-001**: System MUST send a `payment-confirmed` email when a payment status transitions to `paid` via the Mercado Pago webhook.
- **FR-002**: System MUST send a `ticket-confirmed` email when a ticket transitions from `pending_confirmation` to `confirmed`.
- **FR-003**: System MUST send a `ticket-cancelled` email when any ticket transitions to `cancelled`.
- **FR-004**: The payment-confirmed email MUST include the customer name, amount paid, event name, and payment date.
- **FR-005**: The ticket-confirmed email MUST include the customer name, event name, QR image URL, and ticket ID.
- **FR-006**: The ticket-cancelled email MUST include the customer name, event name, and ticket ID.
- **FR-007**: Email sending MUST NOT block or delay the response to the client or webhook caller (fire-and-forget execution).
- **FR-008**: All email sending errors MUST be logged without automatic retry.
- **FR-009**: Email templates MUST support variable interpolation with `{{variable}}` placeholders.
- **FR-010**: The email provider MUST be swappable via a common interface without modifying call sites.
- **FR-011**: System MUST use the `Resend` email provider as the initial implementation.
- **FR-012**: Email templates MUST be static `.html` files stored in the repository, not hosted on external dashboards.

### Key Entities

- **EmailTemplate**: Static HTML files with `{{variable}}` placeholders for dynamic content. Three templates: payment-confirmed, ticket-confirmed, ticket-cancelled.
- **EmailNotification**: A fire-and-forget notification triggered by a state transition in payment or ticket lifecycle. Not persisted.
- **EmailProvider**: Abstraction over email delivery services. Exposes a `send(to, subject, html)` interface. Initial implementation uses Resend.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Emails are triggered within 5 seconds of the triggering state transition (payment to `paid`, ticket to `confirmed` or `cancelled`).
- **SC-002**: Email sending does not increase API response time by more than 100ms (fire-and-forget).
- **SC-003**: All three email types (payment-confirmed, ticket-confirmed, ticket-cancelled) are sent with correct variable interpolation in 100% of successful delivery attempts.
- **SC-004**: Email delivery failures are logged with sufficient context (recipient, template, error reason) to enable debugging.
- **SC-005**: The system gracefully handles provider API unavailability without impacting the primary ticket/payment flows.

## Assumptions

- The Resend API key will be configured via environment variables.
- Email delivery is not guaranteed and is not the source of truth — tickets and payment status are always accessible via the web platform.
- Buyers have valid email addresses stored in their user profile.
- Template rendering uses simple string interpolation of `{{variable}}` placeholders without a templating engine.
- The `EmailProvider` interface follows the same registry pattern used by `PaymentProvider` in the existing codebase.
- WhatsApp, SMS, event reminders, surveys, and scheduled jobs are explicitly out of scope.
