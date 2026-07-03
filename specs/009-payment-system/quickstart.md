# Quickstart: Payment System

## Prerequisites

- Existing backend running (Express + Prisma)
- Mercado Pago test account (credentials: access token, webhook secret)

## Setup

### 1. Environment Variables

Add to `.env`:

```bash
PAYMENT_PROVIDER=mercadopago
MERCADOPAGO_ACCESS_TOKEN=TEST-1234...
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret
FRONTEND_URL=http://localhost:3000
```

### 2. Database Migration

```bash
cd backend
npx prisma migrate dev --name add_payments
```

### 3. Mercado Pago Webhook Configuration

1. Expose local backend via tunnel (e.g., ngrok): `ngrok http 3001`
2. In MP dashboard → Webhooks → Set URL: `https://your-tunnel.ngrok.io/api/payments/webhook`
3. Events to listen: `payment` (only `payment.updated`)

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/payments/checkout` | Required | Create checkout + redirect URL |
| POST | `/api/payments/webhook` | None (signature) | Provider callback |

### Checkout Request

```json
POST /api/payments/checkout
Content-Type: application/json
Authorization: Bearer <token>

{
  "ticket_type_id": "uuid",
  "quantity": 2
}
```

### Checkout Response

```json
201 Created
{
  "payment_id": "uuid",
  "checkout_url": "https://www.mercadopago.com.co/checkout/v1/redirect?preference_id=...",
  "reserve_expires_at": "2026-07-01T20:38:00Z"
}
```

## Testing Flow

1. Use MP test credentials (sandbox).
2. Checkout → redirect to MP sandbox page.
3. Use test card: `5031 7557 3453 0604` (any future expiry, any CVC).
4. Webhook fires → payment `completed`, tickets `confirmed`.
5. Verify in DB: `SELECT * FROM payments; SELECT status FROM tickets WHERE payment_id = '...';`

## Troubleshooting

- **Webhook returns 400**: Check `x-signature` header and `MERCADOPAGO_WEBHOOK_SECRET` match.
- **Provider call fails**: Check `MERCADOPAGO_ACCESS_TOKEN` validity. Sandbox tokens expire.
- **Tickets not releasing**: `reserveExpiresAt` cron must be running. Check background job logs.
