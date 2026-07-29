# API Contracts: ePayco Checkout Provider

## POST /api/payments/checkout (Existing — Extended)

Same endpoint, add `"epayco"` as valid provider value.

**Request**:
```json
{
  "items": [{ "ticketTypeId": "uuid", "quantity": 1 }],
  "backUrl": "https://example.com/checkout/state",
  "provider": "epayco"
}
```

**Response** (status 201):
```json
{
  "paymentId": "uuid",
  "checkoutUrl": "https://checkout.epayco.co/...",
  "preferenceId": "session-id-from-epayco",
  "sessionId": "session-id-from-epayco"
}
```

> `sessionId` is ePayco-specific — used to initialize Smart Checkout widget. `checkoutUrl` and `preferenceId` kept for backward compatibility.

**Errors**: Same as existing (VALIDATION_ERROR, SOLD_OUT, USER_INFO_INCOMPLETE, etc.)

---

## POST /api/payments/webhook/epayco (New)

Receives ePayco confirmation notifications.

**Request**: ePayco webhook payload (form-encoded or JSON per ePayco docs):
```json
{
  "x_ref_payco": "ref-123",
  "x_transaction_id": "txn-456",
  "x_amount": "50000",
  "x_currency_code": "COP",
  "x_signature": "md5hash",
  "x_transaction_date": "2026-07-29",
  "x_response": "Aceptada",
  "x_cod_response": "1",
  "x_approval_code": "000000"
}
```

**Response** (status 200):
```json
{ "received": true }
```

**Security**: Signature verified via `x_signature` using `EPAYCO_P_KEY` + `EPAYCO_CUST_ID_CLIENTE`.

**Idempotency**: Keyed on `x_ref_payco` (maps to `providerTxId`) — duplicate webhooks ignored.

---

## GET /api/payments/epayco/status/:paymentId (New)

Polling endpoint for return page after Smart Checkout completes.

**Response** (status 200):
```json
{
  "paymentId": "uuid",
  "status": "completed",
  "epaycoRef": "ref-123"
}
```

**Behavior**: Queries `https://secure.epayco.co/validation/v1/reference/{ref}` to confirm final status. Returns current DB status if webhook already processed.

---

## Frontend: CheckoutResponse Type Extension

```typescript
// Extended from existing:
type CheckoutResponse = {
  paymentId: string;
  checkoutUrl: string;
  preferenceId: string;
  sessionId?: string;  // NEW: present when provider is "epayco"
};
```

---

## Frontend: ePayco Smart Checkout Integration

1. Include script in page:
```html
<script src="https://checkout.epayco.co/checkout-v2.js"></script>
```

2. On "Pagar con ePayco" click, call `POST /api/payments/checkout` with `provider: "epayco"`

3. Initialize widget with returned `sessionId`:
```typescript
const checkout = ePayco.checkout.configure({ sessionId });
checkout.setHooks({
  onResponse: (data) => { /* redirect to /checkout/state */ },
  onClosed: () => { /* user closed widget */ },
  onErrors: (err) => { /* show error */ },
});
checkout.open();
```

> Script should be dynamically loaded (not bundled) since ePayco serves it from their CDN.

## ePayco Webhook Signature Verification

Algorithm (from ePayco docs):

```
signature = md5(
  p_cust_id_cliente + "^" +
  p_key + "^" +
  ref_payco + "^" +
  amount + "^" +
  currency
)
```

Compare computed signature against received `x_signature`.
