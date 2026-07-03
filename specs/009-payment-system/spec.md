# Feature Specification: Payment System

**Feature Branch**: `009-payment-system`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "Provider-agnostic payment system covering checkout orchestration, Mercado Pago as the initial implementation, webhook processing, and payment lifecycle management."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete Ticket Checkout (Priority: P1)

As a user, I want to select a ticket type and quantity, proceed to checkout, and pay through a secure payment provider so that I can confirm my event tickets.

**Why this priority**: This is the core revenue-generating flow. Without it, users cannot purchase tickets and the platform has no business value.

**Independent Test**: Can be fully tested by creating a ticket reservation, completing payment via Mercado Pago sandbox, and verifying tickets transition from reserved to confirmed.

**Acceptance Scenarios**:

1. **Given** a user has selected a ticket type with available inventory, **When** the user submits checkout with a valid quantity, **Then** the system atomically reserves the tickets, creates a pending payment record, and redirects the user to the payment provider's checkout page.
2. **Given** the user is on the payment provider's checkout page, **When** the user completes payment successfully, **Then** the system receives a webhook confirmation, marks the payment as completed, and confirms the reserved tickets.
3. **Given** the user is on the payment provider's checkout page, **When** the user's payment is declined, **Then** the system receives a webhook notification, marks the payment as failed, and cancels the reserved tickets.
4. **Given** the last ticket of a type is available, **When** two users attempt checkout simultaneously, **Then** exactly one checkout succeeds and the other receives an inventory exhaustion error.

---

### User Story 2 - Payment Webhook Processing (Priority: P1)

As a system, I need to receive and process payment status notifications from the payment provider so that ticket statuses stay synchronized with actual payment outcomes.

**Why this priority**: Webhook processing closes the payment loop. Without it, tickets remain in "reserved" state indefinitely and users never receive confirmed tickets.

**Independent Test**: Can be tested by sending simulated webhook payloads (approved and declined) and verifying ticket and payment state transitions.

**Acceptance Scenarios**:

1. **Given** a pending payment exists with a valid external reference, **When** the system receives an approved payment webhook with a valid signature, **Then** the payment status updates to "completed" and linked tickets transition to "confirmed."
2. **Given** a pending payment exists, **When** the system receives a declined payment webhook with a valid signature, **Then** the payment status updates to "failed" and linked tickets transition to "cancelled."
3. **Given** a payment already in "completed" state, **When** the system receives a duplicate approved webhook, **Then** the system returns a success response without modifying any state.
4. **Given** any webhook arrives without a valid provider signature, **When** the system processes the webhook, **Then** the system rejects it with an error response and performs no state changes.

---

### User Story 3 - Payment Failure Recovery (Priority: P2)

As a user, if the payment provider is temporarily unavailable after I submit checkout, I want my reserved tickets to be automatically released so that I am not charged for tickets I cannot complete payment for.

**Why this priority**: Prevents ticket inventory lock-up from abandoned or failed checkouts, ensuring inventory remains available for other users.

**Independent Test**: Can be tested by creating a reservation, simulating provider unavailability, and verifying tickets are released after the expiration window.

**Acceptance Scenarios**:

1. **Given** a user has reserved tickets but the payment provider call failed, **When** the reservation TTL expires (10 minutes), **Then** the tickets revert to available inventory and the payment record remains in "pending" state.
2. **Given** a user has reserved tickets with a pending payment, **When** the user navigates back to the ticketing page, **Then** the user sees the reservation expiration time and can choose to retry checkout.

---

### User Story 4 - Provider Extensibility (Priority: P3)

As a system administrator, I want to add a new payment provider (e.g., Wompi, Stripe) by creating a provider-specific configuration file without modifying core payment logic, so that the platform can expand payment options with minimal risk.

**Why this priority**: Enables future payment provider additions without touching tested business logic, reducing regression risk.

**Independent Test**: Can be tested by adding a mock provider implementation and verifying it can be activated via environment configuration without code changes to the payment service.

**Acceptance Scenarios**:

1. **Given** a new provider implementation file is created and registered, **When** the system's payment provider environment variable is updated to the new provider name, **Then** the checkout and webhook flows use the new provider without any changes to the payment service or routes.

---

### Edge Cases

- What happens when the user closes the browser before completing payment on the provider page? Tickets remain in "reserved" state until TTL expiry; payment stays "pending."
- What happens when the webhook arrives but the payment record no longer exists (e.g., deleted by admin)? System returns a not-found response; no state changes occur.
- What happens when the provider returns a webhook with an unrecognized event type? System logs the event and returns a success response without modifying payment or ticket state.
- What happens when the checkout succeeds but the provider call fails (network error after DB commit)? Tickets expire via existing cron; user can retry checkout with the same payment record.
- What happens when two webhooks arrive simultaneously for the same payment? Idempotency check ensures only the first webhook modifies state; the second is a no-op.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-1**: System MUST atomically reserve tickets and create a pending payment record before contacting the payment provider, using a single database transaction.
- **FR-2**: The payment service MUST NOT import or reference any payment provider SDK directly; it MUST interact only through a provider-agnostic interface.
- **FR-3**: Webhook processing MUST be idempotent — duplicate webhooks for the same payment in a final state (completed or failed) MUST return success without modifying state.
- **FR-4**: Webhooks MUST be rejected with an error response if the provider signature verification fails.
- **FR-5**: The system MUST use a single unique payment identifier as the universal reference for all provider communications (checkout preferences, webhook lookups).
- **FR-6**: Adding a new payment provider MUST require only creating a provider implementation file and registering it, with zero changes to the payment service, webhook handler, or route definitions.
- **FR-7**: If the payment provider call fails after the database transaction commits, tickets MUST expire automatically via the existing reservation TTL mechanism.
- **FR-8**: System MUST redirect users to a post-payment landing page on the frontend after provider checkout completion, reflecting the payment outcome.
- **FR-9**: Checkout MUST validate input (ticket type, quantity) before initiating any database operations.

### Key Entities

- **Payment**: Represents a financial transaction attempt. Key attributes: unique identifier, user reference, event reference, provider name, provider transaction ID, amount in minor currency units, status (pending, completed, failed), metadata, timestamps. Relationships: belongs to one user, belongs to one event, linked to one or more tickets.
- **PaymentStatus**: Enum representing the lifecycle of a payment — pending (initial), completed (provider confirmed), failed (provider declined or expired).
- **Ticket**: Event admission unit. Gains a payment reference linking it to a specific payment transaction. Lifecycle: available → reserved → confirmed (payment success) or cancelled (payment failure/expiry).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the full checkout flow (from ticket selection to payment confirmation) in under 3 minutes under normal conditions.
- **SC-002**: Concurrent checkout attempts for the last available ticket slot result in exactly one successful reservation and confirmation.
- **SC-003**: 100% of valid approved webhooks result in tickets confirmed within 5 seconds of webhook receipt.
- **SC-004**: 100% of valid declined webhooks result in tickets cancelled and inventory released within 5 seconds.
- **SC-005**: Duplicate webhooks for the same payment in a final state produce zero side effects and return a success response.
- **SC-006**: Adding a new payment provider requires changes only to provider-specific files, with zero modifications to core payment logic.
- **SC-007**: Reserved tickets from failed or abandoned checkouts are automatically released within 10 minutes.

## Assumptions

- The platform operates in the Colombian market, processing transactions in Colombian Pesos (COP).
- An existing ticket reservation cron job handles TTL-based expiration of reserved tickets.
- Users have stable internet connectivity for checkout completion.
- Mercado Pago is the initial and only payment provider for launch; additional providers will be added later.
- The payment provider supports hosted checkout pages (redirect-based flow).
- The existing authentication system provides user identity for associating payments with users.
- The platform's frontend already has a user account/ticket management section where post-payment results are displayed.
