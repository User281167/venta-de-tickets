# Feature Specification: ePayco Checkout Provider

**Feature Branch**: `020-epayco-checkout`

**Created**: 2026-07-29

**Status**: Draft

**Input**: User description: "implement payment checkout provider with epayco"

## User Scenarios & Testing

### User Story 1 - Purchase Tickets with ePayco (Priority: P1)

Customer selects ticket type, proceeds to checkout, chooses ePayco as payment method, completes payment through ePayco Smart Checkout, receives ticket confirmation.

**Why this priority**: Core revenue flow. Without a working checkout, ticket sales cannot happen for users who prefer ePayco as payment method.

**Independent Test**: Can be tested end-to-end by selecting ePayco at checkout, creating a session, completing payment on ePayco's page, and verifying a payment record with `completed` status exists.

**Acceptance Scenarios**:

1. **Given** a customer has selected a ticket type, **When** they proceed to checkout and select ePayco as provider, **Then** the system creates an ePayco checkout session and returns a `sessionId` for the Smart Checkout widget
2. **Given** an ePayco checkout session has been created, **When** the customer completes payment on ePayco Smart Checkout, **Then** the system receives a webhook notification and marks the payment as `completed`
3. **Given** a customer is redirected back from ePayco after payment, **When** the response page loads, **Then** the system queries the ePayco API to confirm the transaction status and displays the result to the user

---

### User Story 2 - ePayco Webhook Processing (Priority: P1)

The backend receives and processes payment notifications from ePayco to update payment statuses.

**Why this priority**: Webhook processing is the reliable mechanism to know payment outcomes. The response page redirect alone is not trustworthy.

**Independent Test**: Can be tested by sending a simulated ePayco webhook payload with a known signature to the confirmation endpoint and verifying the payment record is updated correctly.

**Acceptance Scenarios**:

1. **Given** an ePayco webhook arrives with a valid `x_signature`, **When** processed, **Then** the system verifies the signature and extracts the transaction reference and status
2. **Given** an ePayco webhook has an invalid or missing signature, **When** processed, **Then** the system rejects the notification with a 401 response
3. **Given** an ePayco webhook indicates an `approved` transaction, **When** processed, **Then** the payment status is updated to `completed` and ticket creation proceeds
4. **Given** an ePayco webhook indicates a `rejected` or `cancelled` transaction, **When** processed, **Then** the payment status is updated to `failed`
5. **Given** the same ePayco webhook is received multiple times, **When** processed, **Then** the system handles idempotency and does not create duplicate tickets

---

### User Story 3 - Checkout Provider Selection (Priority: P2)

Users can choose between available payment providers (Mercado Pago, ePayco) during checkout.

**Why this priority**: Provider choice improves conversion for users who prefer one provider over another.

**Independent Test**: Can be tested by observing that the checkout UI offers both Mercado Pago and ePayco as selectable options and routes to the correct provider flow.

**Acceptance Scenarios**:

1. **Given** multiple payment providers are registered, **When** a user initiates checkout, **Then** they can select from available providers including ePayco
2. **Given** a user selects ePayco and completes checkout, **When** the payment record is created, **Then** it stores `epayco` as the provider identifier

---

### Edge Cases

- What happens when the ePayco API (apify.epayco.co) is unavailable during checkout creation? (Return error to user; payment record not created)
- How does the system handle ePayco Bearer token expiration (20 min TTL)? (Fetch a new token for each checkout session or proactively refresh before expiry)
- What happens when a webhook arrives for a payment reference that does not exist in the system? (Log and return 404; ePayco may retry)
- How does the system handle the response page redirect being accessed without a completed webhook? (Display pending status and instruct user to wait or check their email)
- What happens if the ePayco JavaScript library fails to load in the browser? (Fallback to a manual payment link or display an error)
- How does the system handle partial refunds or chargebacks via ePayco? (Defined out of scope for v1 — ticket remains checked-in; operational refund handled externally)

## Requirements

### Functional Requirements

- **FR-001**: System MUST implement the `PaymentProvider` interface for ePayco with methods: `getProviderName`, `createCheckout`, `verifySignature`, `parseWebhook`
- **FR-002**: `createCheckout` MUST authenticate against ePayco Apify API using `PUBLIC_KEY` and `PRIVATE_KEY` credentials to obtain a Bearer token
- **FR-003**: `createCheckout` MUST create an ePayco checkout session via `POST /payment/session/create` and return the `sessionId` in a format usable by the frontend
- **FR-004**: System MUST expose a webhook endpoint at `POST /api/payments/webhook/epayco` to receive ePayco payment confirmations
- **FR-005**: `verifySignature` MUST validate the `x_signature` header using `p_cust_id_cliente`, `p_key`, and the received payload according to ePayco's signature algorithm
- **FR-006**: `parseWebhook` MUST extract `x_ref_payco` (external reference), transaction status, and `ref_payco` from the ePayco webhook payload and return a `NormalizedWebhookEvent`
- **FR-007**: System MUST map ePayco status values: `approved` → `approved`, `rejected`/`cancelled`/`expired` → `declined`, `pending` → `pending`
- **FR-008**: System MUST register the ePayco provider in `provider.registry.ts` as `epayco`
- **FR-009**: Frontend MUST display ePayco as an available payment provider option during checkout
- **FR-010**: Frontend MUST initialize ePayco Smart Checkout with the `sessionId` returned from `createCheckout` when user selects ePayco
- **FR-011**: Frontend MUST include the `https://checkout.epayco.co/checkout-v2.js` script and configure it via `ePayco.checkout.configure()` with the session ID
- **FR-012**: Frontend MUST handle ePayco Smart Checkout hooks: `onResponse` (to redirect user to return page), `onClosed` (user closed widget without completing), `onErrors` (payment errors)
- **FR-013**: System MUST provide a confirmation polling endpoint that queries ePayco API for transaction status, so the return page can verify payment outcome

### Key Entities

- **ePayco Provider**: A concrete implementation of the `PaymentProvider` interface that communicates with ePayco APIs (Apify) for checkout session creation, webhook signature verification, and webhook event parsing.
- **ePayco Session**: A unique checkout session created on ePayco's servers. Each session has a `sessionId` used to initialize the Smart Checkout widget on the frontend. Sessions expire after a configurable time.
- **Payment**: A financial transaction record linking a user to a purchase. Stores the provider name (`epayco`), provider transaction ID (`ref_payco`), and status (`pending` → `completed` / `failed` / `refunded`).

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can complete a ticket purchase through ePayco in under 3 minutes from checkout initiation to payment confirmation
- **SC-002**: ePayco webhook processing (signature verification + status update) completes in under 500ms
- **SC-003**: The system correctly rejects all webhook notifications with invalid or missing signatures (verified through automated tests)
- **SC-004**: Duplicate webhook notifications from ePayco do not result in duplicate tickets or duplicate payment status updates
- **SC-005**: Adding a new payment provider (ePayco) requires no changes to the existing core checkout or webhook processing logic

## Assumptions

- New ePayco provider follows the existing `PaymentProvider` interface defined in `payments.types.ts` — no interface changes needed
- ePayco credentials (`PUBLIC_KEY`, `PRIVATE_KEY`, `P_KEY`, `CUST_ID_CLIENTE`) are configured via environment variables following the existing pattern
- ePayco Bearer token (20 min TTL) is obtained fresh for each checkout session creation; no token caching in v1
- ePayco confirmation URL will be configured to point at the production webhook endpoint by the platform operator
- ePayco Smart Checkout v2 is the integration method used (not onpage or modal variants)
- The return page polling endpoint uses the ePayco validation API (`https://secure.epayco.co/validation/v1/reference/{ref}`) to confirm transaction status
- Response page handling (URL redirect with query params) is secondary to webhook processing — webhook is the source of truth
- Existing `epayco-sdk-node` (v1.4.4) is available in `package.json` but may be used only if it simplifies integration; direct API calls to Apify are acceptable
