# Contract: PaymentProvider Interface

**Purpose**: Enables provider-agnostic payment orchestration. Service layer never imports a concrete provider.

## Interface

```typescript
interface PaymentProvider {
  createCheckout(params: CreateCheckoutParams): Promise<CreateCheckoutResult>;
  verifySignature(payload: WebhookPayload, signature: string): boolean;
  parseWebhook(payload: unknown): NormalizedWebhookEvent;
  getProviderName(): string;
}
```

## Types

### CreateCheckoutParams

| Field | Type | Description |
|-------|------|-------------|
| externalReference | string | Payment ID (the universal reference) |
| amountCents | number | Amount in minor currency units (e.g., COP cents) |
| title | string | Line-item description (e.g., "2x General Admission") |
| backUrl | string | Frontend URL to redirect after payment |
| expiresAt | string (ISO) | ISO timestamp for preference expiry |

### CreateCheckoutResult

| Field | Type | Description |
|-------|------|-------------|
| checkoutUrl | string | URL to redirect user for payment |
| providerTxId | string | Provider-side preference/transaction ID |

### NormalizedWebhookEvent

| Field | Type | Description |
|-------|------|-------------|
| externalReference | string | Payment ID (matched to `payment.id`) |
| eventType | 'approved' \| 'declined' | Normalized event classification |
| raw | unknown | Original provider payload (stored in `metadata`) |

## Flow

```
service ──> provider.createCheckout(params) ──> checkoutUrl (to user)
webhook ──> provider.verifySignature() ──> true/false
webhook ──> provider.parseWebhook() ──> NormalizedWebhookEvent
```

## Registry

```typescript
function getProvider(name: string): PaymentProvider
```

Registered in `provider.registry.ts`. Throws if name not recognized.
