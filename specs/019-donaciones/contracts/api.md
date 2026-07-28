# API Contracts: Donaciones

## Base URL

`/api/donaciones`

All endpoints return JSON responses with appropriate HTTP status codes.

---

## POST /api/donaciones

Create a new donation preference and redirect to Mercado Pago.

### Request

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "fullName": "Juan Pérez" | null,
  "email": "juan@example.com" | null,
  "amountCents": 50000,
  "account": "LA_CONVENCION" | "BARRANQUEROS_UTP"
}
```

**Schema**:
```typescript
{
  fullName?: string | null;      // Optional, nullable
  email?: string | null;         // Optional, nullable, email format
  amountCents: number;           // Required, integer, min 2000
  account: "LA_CONVENCION" | "BARRANQUEROS_UTP";  // Required
}
```

### Response

**Status**: 201 Created

**Body**:
```json
{
  "initPoint": "https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=..."
}
```

**Schema**:
```typescript
{
  initPoint: string;  // Mercado Pago checkout URL
}
```

### Errors

| Status | Code | Description |
|--------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request body (schema validation failed) |
| 400 | `MIN_AMOUNT_ERROR` | amountCents < 2000 |
| 500 | `PROVIDER_ERROR` | Mercado Pago API error |

---

## POST /api/donaciones/webhook/mercadopago-la-convencion

Handle Mercado Pago webhook notification for La Convención account.

### Request

**Headers**:
```
Content-Type: application/json
x-signature: <MP signature>
x-request-id: <MP request ID>
```

**Body**: Raw Mercado Pago webhook payload (any valid MP webhook format)

### Response

**Status**: 200 OK (always, even on processing errors - MP expects 200)

**Body**: Empty or `{ "status": "processed" }`

### Processing

- Verifies signature using La Convención credentials
- Parses webhook payload
- Updates donation state based on payment status
- Stores raw payload in metadata field
- Idempotent: only processes if donation state is `pending`

---

## POST /api/donaciones/webhook/mercadopago-barranqueros-utp

Handle Mercado Pago webhook notification for Barranqueros UTP account.

### Request

**Headers**:
```
Content-Type: application/json
x-signature: <MP signature>
x-request-id: <MP request ID>
```

**Body**: Raw Mercado Pago webhook payload

### Response

**Status**: 200 OK

**Body**: Empty or `{ "status": "processed" }`

### Processing

- Same as La Convención webhook but uses Barranqueros UTP credentials
- Verifies signature using Barranqueros UTP webhook secret

---

## GET /api/donaciones/:externalReference/status

Get current donation status for polling on return page.

### Request

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| externalReference | string | Yes | The donation's external reference (format: DON-{account}-{uuid}) |

### Response

**Status**: 200 OK

**Body**:
```json
{
  "state": "pending" | "confirmed" | "rejected" | "cancelled",
  "account": "LA_CONVENCION" | "BARRANQUEROS_UTP",
  "amountCents": 50000,
  "fullName": "Juan Pérez" | null,
  "createdAt": "2026-07-28T12:00:00Z"
}
```

**Schema**:
```typescript
{
  state: DonationStatus;
  account: DonationAccount;
  amountCents: number;
  fullName: string | null;
  createdAt: string;  // ISO 8601
}
```

### Errors

| Status | Code | Description |
|--------|------|-------------|
| 404 | `NOT_FOUND` | Donation with externalReference not found |

---

## Types

### DonationStatus

```typescript
type DonationStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';
```

### DonationAccount

```typescript
type DonationAccount = 'LA_CONVENCION' | 'BARRANQUEROS_UTP';
```

---

## Webhook Notification URL Configuration

When creating Mercado Pago preferences, the `notification_url` must be set explicitly:

- For La Convención: `https://<API_URL>/api/donaciones/webhook/mercadopago-la-convencion`
- For Barranqueros UTP: `https://<API_URL>/api/donaciones/webhook/mercadopago-barranqueros-utp`

These URLs must be configured in the Mercado Pago dashboard for each account and must be publicly accessible.

---

## Security Considerations

1. **Webhook Signature Verification**: All webhook requests must have valid signatures
2. **No Logging**: Webhook payload must NOT be logged outside the metadata field (Ley 1581)
3. **Idempotency**: Webhook handlers must be idempotent (same request = same result)
4. **CORS**: GET status endpoint should be accessible from frontend domain
5. **Rate Limiting**: Consider rate limiting on POST /donaciones to prevent abuse
