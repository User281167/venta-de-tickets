# Data Model: ePayco Checkout Provider

No new database tables. Feature reuses existing `Payment` model.

## Existing Entities (No Changes)

### Payment

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | PK |
| `userId` | UUID (FK → users) | Buyer |
| `provider` | VARCHAR(50) | `"epayco"` for ePayco payments |
| `providerTxId` | VARCHAR(255) | ePayco `ref_payco` |
| `subtotalCents` | Int | |
| `discountCents` | Int | |
| `totalCents` | Int | |
| `status` | PaymentStatus enum | `pending` → `completed` / `failed` |
| `metadata` | JSON | Stores ePayco session ID and raw webhook payload |
| `createdAt` | TIMESTAMPTZ | |
| `updatedAt` | TIMESTAMPTZ | |

Status transitions: `pending` → `completed` | `failed` (same as Mercado Pago)

## New Internal Type: ApifyAuthState

Not persisted. In-memory cache used by `ApifyAuthService`:

| Field | Type | Description |
|-------|------|-------------|
| `token` | string | Bearer JWT from ePayco Apify login |
| `expiresAt` | Date | Token expiry (from JWT `exp` claim) |

## Configuration (Environment)

| Variable | Description |
|----------|-------------|
| `EPAYCO_PUBLIC_KEY` | ePayco API public key (Basic auth username) |
| `EPAYCO_PRIVATE_KEY` | ePayco API private key (Basic auth password) |
| `EPAYCO_P_KEY` | ePayco p_key for webhook signature verification |
| `EPAYCO_CUST_ID_CLIENTE` | ePayco customer ID for webhook signature verification |
