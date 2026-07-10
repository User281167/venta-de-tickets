# Feature Specification: Payment Multi-Provider Architecture & Ticket QR Entrance

**Feature Branch**: `011-payment-ticket-entrance`

**Created**: 2026-07-09

**Status**: Draft

**Input**: User description: "Create payment architecture for multiple providers (Mercado Pago, PayPal, Stripe). Implement Mercado Pago. Create ticket entrance system with QR code (JWT signed, no user info in payload). QR contains ticket UUID + timestamp. Tickets created on successful payment webhook. Check-in endpoint validates JWT, checks DB status, atomically marks entry."

## User Scenarios & Testing

### User Story 1 - Ticket Purchase & QR Delivery (Priority: P1)

Customer browses event, selects ticket type, proceeds to checkout, completes payment through chosen provider, receives ticket with scannable QR code.

**Why this priority**: Core revenue-generating flow. Without purchase capability, ticket sales cannot happen.

**Independent Test**: Can be tested end-to-end by creating a checkout session, simulating successful payment webhook, and verifying a ticket with valid QR code exists in the database for that user.

**Acceptance Scenarios**:

1. **Given** a customer has selected a ticket type, **When** they initiate checkout, **Then** the system creates a payment record with status `pending` and redirects them to the payment provider's checkout page
2. **Given** a customer has completed payment on the provider's page, **When** the provider sends a successful payment webhook, **Then** the system updates payment status to `completed`, creates a ticket record with `paid` status, generates a JWT-signed QR token containing only ticket UUID and timestamp, and the QR is embedded in the ticket record
3. **Given** payment webhook processing fails midway, **When** the system retries or receives a duplicate webhook, **Then** the system handles idempotency and does not create duplicate tickets
4. **Given** a payment is completed but the ticket type has reached its maximum capacity between checkout and webhook arrival, **When** the webhook is processed, **Then** the payment is marked as `refunded` and the customer is notified

---

### User Story 2 - QR Entry Check-in (Priority: P1)

Event staff scans attendee's QR code at entrance, system validates the QR, verifies the ticket status, and atomically registers entry to prevent double check-in.

**Why this priority**: The core access-control function. Without it, there is no way to validate tickets at the door.

**Independent Test**: Can be tested by presenting a valid QR code from a paid ticket, verifying check-in succeeds, then presenting the same QR again and verifying it is rejected as already checked in.

**Acceptance Scenarios**:

1. **Given** an attendee presents a QR code at the entrance, **When** the QR is scanned and its JWT signature is verified, **Then** the system decodes the ticket UUID and proceeds to validation
2. **Given** a QR code has an invalid or tampered signature, **When** scanned, **Then** the system rejects the QR immediately without querying the database
3. **Given** a valid QR code references a ticket with `paid` status and no previous check-in, **When** scanned, **Then** the system atomically updates the ticket to `checked_in` status, records the timestamp and checker identity, and returns success
4. **Given** two scanners simultaneously scan the same valid QR code, **When** both attempt check-in concurrently, **Then** only one succeeds (atomic FOR UPDATE pattern) and the second receives a "ticket already checked in" response
5. **Given** a valid QR code references a ticket with status other than `paid` (e.g., `cancelled`, `refunded`), **When** scanned, **Then** the system rejects entry with a clear reason

---

### User Story 3 - Multi-Provider Payment Architecture (Priority: P2)

System supports multiple payment providers through a common interface. New providers can be added without modifying core checkout and webhook processing logic.

**Why this priority**: Enables future provider additions without rewriting payment flow. Secondary to getting first provider working.

**Independent Test**: Can be tested by registering a mock provider implementation that captures checkout requests and returns controlled webhook payloads, verifying the core flow works identically regardless of provider.

**Acceptance Scenarios**:

1. **Given** a payment provider implements the standard interface, **When** registered in the system, **Then** it can process checkouts and receive webhooks without modifying core purchase flow
2. **Given** the system is configured to use a specific provider, **When** a checkout is initiated, **Then** the correct provider's `createCheckout` method is called
3. **Given** a generic checkout input (ticket type, quantity, customer info), **When** passed to any provider's `createCheckout`, **Then** the provider returns a normalized `CheckoutResult` with provider-agnostic fields
4. **Given** a payment webhook arrives from any provider, **When** processed through the provider's `normalizeWebhookEvent`, **Then** the system receives a normalized webhook event and processes it identically regardless of source

---

### Edge Cases

- What happens when the payment webhook arrives before the checkout session is created? (Webhook should be queued/retried or rejected with 404; provider retries)
- How does the system handle duplicate webhook notifications from the same provider? (Idempotency key on provider transaction ID)
- What happens if `QR_JWT_SECRET` is rotated while active QR codes are in circulation? (Existing QR codes become invalid; plan secret rotation with grace period)
- How does the system handle a ticket type being deleted or disabled after a purchase is initiated but before the webhook arrives? (Validate ticket type availability at webhook time, refund if no longer available)
- What happens when a network failure occurs between the system and the payment provider during checkout creation? (Return error to user, no payment record created)
- What happens when the QR code is scanned but the database is temporarily unavailable? (Return transient error, scanner retries)
- How does the system handle non-ASCII characters in ticket type names or descriptions during QR generation? (QR token is a JWT containing only UUID and timestamp — no user-facing text)
- What happens to tickets in `reserved` or `pending` status that never complete payment? (No cleanup needed — user spec says ticket does not need reserve expiry; unpaid tickets remain in pending state)

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a provider-agnostic payment interface with `createCheckout`, `verifyWebhookSignature`, and `normalizeWebhookEvent` methods
- **FR-002**: System MUST register at least one concrete payment provider (Mercado Pago) through the provider interface
- **FR-003**: System MUST support adding new providers without modifying existing checkout or webhook processing code
- **FR-004**: System MUST create a payment record with status `pending` when a user initiates checkout
- **FR-005**: System MUST create a ticket and generate its QR code only after receiving a confirmed successful payment webhook
- **FR-006**: System MUST generate QR codes as JWT tokens signed with `QR_JWT_SECRET`, containing only `tid` (ticket UUID) and `iat` (issued at timestamp) in the payload
- **FR-007**: System MUST NOT include any user-identifiable information in the QR code payload
- **FR-008**: System MUST provide an endpoint for QR code check-in that first verifies the JWT signature, then validates the ticket status in the database
- **FR-009**: System MUST reject scanned QR codes with invalid or tampered JWT signatures without querying the database
- **FR-010**: System MUST atomically update the ticket status to `checked_in` using row-level locking (FOR UPDATE) to prevent double check-in from concurrent scans
- **FR-011**: System MUST reject check-in for tickets with status other than `paid` (e.g., `cancelled`, `refunded`, or already `checked_in`)
- **FR-012**: System MUST record `checkedInAt` timestamp and `checkedInBy` (checker identity) when check-in succeeds
- **FR-013**: System MUST handle duplicate payment webhook notifications idempotently without creating duplicate tickets or duplicate status updates
- **FR-014**: System MUST validate ticket type availability at webhook processing time and refund payment if the ticket type is no longer available

### Key Entities

- **Payment Provider**: An external payment service (Mercado Pago, PayPal, Stripe) that processes financial transactions. Each provider implements a common interface for checkout creation, webhook signature verification, and webhook event normalization.
- **Payment**: A financial transaction record linking a user to a purchase. Tracks provider, provider transaction ID, amount, and status through lifecycle: `pending` → `completed` / `failed` / `refunded`.
- **Ticket**: An individual entry pass created upon successful payment. Contains a unique JWT-signed QR code for check-in. Status transitions: `paid` → `checked_in`. Tickets do not have a reserve expiry period.
- **QR Code**: A JWT token encoding the ticket UUID and issuance timestamp, signed with `QR_JWT_SECRET`. Scanned at the entrance for validation. Contains no user information.
- **Check-in**: The act of validating a ticket at the event entrance. Record includes who performed the check-in and when.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can complete ticket purchase through Mercado Pago in under 3 minutes from checkout initiation to payment confirmation
- **SC-002**: QR code check-in completes in under 1 second from scan to entry confirmation (including JWT verification and database update)
- **SC-003**: System prevents double check-in for the same ticket under concurrent scan attempts (verified through automated concurrency testing)
- **SC-004**: New payment providers can be integrated by implementing 3 methods (createCheckout, verifyWebhookSignature, normalizeWebhookEvent) without changes to core purchase or webhook processing logic
- **SC-005**: System correctly rejects all counterfeit or tampered QR codes (verified through automated tests with modified JWT signatures)
- **SC-006**: Payment webhook processing handles duplicate notifications without creating duplicate tickets or payment status changes

## Assumptions

- Payment provider interface from existing codebase (PaymentProvider with createCheckout, verifyWebhookSignature, normalizeWebhookEvent) is suitable for multi-provider support and requires only minor adjustments
- Database schema (Payment and Ticket models) already includes all necessary fields; no migration needed
- Check-in endpoint requires authentication with checker role; only authorized event staff can scan QR codes
- Each payment webhook includes a unique transaction ID per provider that can be used for idempotency
- QR_JWT_SECRET key rotation is managed operationally and out of scope for this feature
- Existing Mercado Pago provider implementation in `payments/providers/mercadopago.provider.ts` is functional and serves as the reference implementation for the provider interface
- The system already has the `qrcode` npm library available for generating QR code images alongside the JWT token
- Ticket reservations do not expire (user explicitly stated "ticket user no need reserve expired")
- Event staff have access to QR scanning hardware or software that can present the QR content to the check-in endpoint
