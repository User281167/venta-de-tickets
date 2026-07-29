# Research: ePayco Checkout Provider

## Decisions

### 1. Integration Method: Smart Checkout v2 (Onpage)

**Decision**: Use ePayco Smart Checkout v2 `onpage` mode — embed checkout widget directly in the page via JS library, not redirect to ePayco hosted page.

**Rationale**: The user explicitly requested "onpage checkout with session ID". Onpage mode keeps users on the platform during payment, reducing bounce. The session-based flow (backend creates session → frontend renders widget) matches the existing multi-provider architecture pattern.

**Alternatives considered**:
- **Redirect mode**: Simpler but breaks UX flow.
- **API-only (no widget)**: Requires building custom card form and PCI compliance — unnecessary complexity given ePayco's PCI-compliant widget.

### 2. Apify Auth: Dedicated Service with Lazy Refresh

**Decision**: Create `ApifyAuthService` class that lazily obtains and caches the Bearer token. On 401 response, refreshes automatically.

**Rationale**: ePayco Bearer token has 20-min TTL. Creating a new token per checkout session adds latency (~200-500ms per `POST /login`). A dedicated service with caching reduces latency while handling expiration transparently.

**Alternatives considered**:
- **Fresh token per session**: Simple but adds unnecessary latency.
- **Background renewal cron**: Over-engineered for current volume.

### 3. Webhook Flow: Reuse Existing Handler

**Decision**: The existing `payments.service.ts` webhook handler is provider-agnostic — it calls `provider.verifySignature()` and `provider.parseWebhook()` then processes the normalized result. ePayco provider implements these methods; no handler changes needed.

**Rationale**: The multi-provider architecture was designed for exactly this. Adding a new provider should require zero changes to core webhook processing logic.

### 4. Confirmation Endpoint: Use ePayco Validation API

**Decision**: After Smart Checkout completes, the frontend polls a backend endpoint that queries `https://secure.epayco.co/validation/v1/reference/{ref}` to confirm transaction status. Webhook remains the source of truth.

**Rationale**: Smart Checkout `onResponse` hook returns basic transaction info but is not fully reliable (user could close browser before response arrives). Polling the ePayco validation API provides a reliable fallback.

### 5. Error Handling Strategy

**Decision**: Choke on initialization errors (missing env vars → 500 startup). Gracefully handle runtime errors (API timeout → user-visible error message, retry button).

**Rationale**: Misconfigured payment provider must fail fast. Transient network failures should not crash the app.

## ePayco API Reference

| Operation | Method | Endpoint | Auth |
|-----------|--------|----------|------|
| Login | POST | `https://apify.epayco.co/login` | Basic (PUBLIC_KEY:PRIVATE_KEY) |
| Create session | POST | `https://apify.epayco.co/payment/session/create` | Bearer token |
| Validate transaction | GET | `https://secure.epayco.co/validation/v1/reference/{ref}` | None (public) |
| Webhook (confirmation) | POST | (configured in session) | Signature (`x_signature`) |

## Key Differences from Mercado Pago

| Aspect | Mercado Pago | ePayco |
|--------|-------------|--------|
| Auth | Static access token | Bearer token (20-min TTL) |
| Checkout | Returns redirect URL | Returns `sessionId` for JS widget |
| Webhook signature | `x-signature` + `x-request-id` | `x_signature` (md5 hash) |
| Frontend integration | Redirect to MP page | JS library + onpage widget |
