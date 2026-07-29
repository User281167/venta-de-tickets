# Quickstart: ePayco Checkout Provider

## Prerequisites

- ePayco account (dashboard.epayco.co)
- API keys: PUBLIC_KEY, PRIVATE_KEY, P_KEY, CUST_ID_CLIENTE
- Backend dependencies installed (`pnpm install`)
- ePayco confirmation URL configured in dashboard https://your-api.com/api/payments/webhook/epayco

## Environment Setup

Add to `backend/.env`:

```env
EPAYCO_PUBLIC_KEY=your_public_key
EPAYCO_PRIVATE_KEY=your_private_key
EPAYCO_P_KEY=your_p_key
EPAYCO_CUST_ID_CLIENTE=your_customer_id
```

## Backend

### 1. Apify Auth Service

Create `backend/src/modules/payments/providers/epayco/apify-auth.service.ts`:

- `login()`: POST `https://apify.epayco.co/login` with Basic auth → returns Bearer token
- `getToken()`: returns cached token or refreshes if expired

### 2. ePayco Provider

Create `backend/src/modules/payments/providers/epayco.provider.ts`:

- Implements `PaymentProvider` interface
- `createCheckout()`: calls Apify `/payment/session/create` → returns sessionId
- `verifySignature()`: validates `x_signature` via md5 algorithm
- `parseWebhook()`: extracts reference, status, externalId from webhook payload

### 3. Register Provider

Edit `backend/src/modules/payments/providers/provider.registry.ts`:

```typescript
import { EpaycoProvider } from './epayco.provider.js';
registerProvider('epayco', new EpaycoProvider());
```

### 4. Add Webhook Route

Edit `backend/src/modules/payments/payments.routes.ts` — the existing `/payments/webhook/:provider` route already handles this. ePayco webhooks POST to `/api/payments/webhook/epayco`.

### 5. Add Env Vars

Edit `backend/src/shared/config/env.ts` and `backend/.env.example`:

```typescript
EPAYCO_PUBLIC_KEY: z.string().min(1, 'EPAYCO_PUBLIC_KEY is required'),
EPAYCO_PRIVATE_KEY: z.string().min(1, 'EPAYCO_PRIVATE_KEY is required'),
EPAYCO_P_KEY: z.string().min(1, 'EPAYCO_P_KEY is required'),
EPAYCO_CUST_ID_CLIENTE: z.string().min(1, 'EPAYCO_CUST_ID_CLIENTE is required'),
```

## Frontend

### 1. ePayco API Module

Create `frontend/features/payments/api/epayco.ts`:

- `createEpaycoSession(items)`: calls checkout API with `provider: "epayco"`
- `pollEpaycoStatus(paymentId)`: polls status endpoint

### 2. ePayco Checkout Button

Create `frontend/features/payments/components/EpaycoCheckoutButton.tsx`:

- On click: create checkout session → get `sessionId` → init Smart Checkout widget
- Dynamically load `https://checkout.epayco.co/checkout-v2.js` (or use existing static import)
- Handle `onResponse`, `onClosed`, `onErrors` hooks

### 3. Add Provider Selector

Edit `frontend/features/ticket-purchase/components/CheckoutPageClient.tsx`:

- Add ePayco as payment option alongside Mercado Pago
- Render `EpaycoCheckoutButton` when ePayco selected

### 4. Add Types

Create `frontend/features/payments/types/epayco.ts` with ePayco-specific types.

## Testing

### Unit Tests

- `backend/src/modules/payments/providers/epayco.test.ts`: Test `ApifyAuthService`, `EpaycoProvider.createCheckout`, `verifySignature`, `parseWebhook`

### Integration Tests

- `backend/tests/integration/payments.test.ts`: Add ePayco webhook processing scenarios

### E2E Tests

- `frontend/tests/e2e/epayco-checkout.spec.ts`: Test checkout flow (mock ePayco responses)
