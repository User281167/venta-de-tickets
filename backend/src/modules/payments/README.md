# Payments Module — Multi-Provider Payment Processor

Checkout, webhook, payment status, and admin sale endpoints.

## Routes

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/checkout` | Create checkout session | JWT user |
| POST | `/api/payments/webhook/:provider` | Provider webhook | Public |
| GET | `/api/payments/:id/status` | Payment status + tickets | JWT owner/admin |
| GET | `/api/admin/payments` | List all payments (admin) | JWT admin |
| GET | `/api/admin/payments/:id` | Payment detail (admin) | JWT admin |
| POST | `/api/admin/sales` | Manual sale creation (admin) | JWT admin |
| GET | `/api/me/payments` | Client payment history | JWT client |

## Errors

| Code | Status | Cause |
|------|--------|-------|
| `VALIDATION_ERROR` | 422 | Invalid request data (Zod) |
| `TICKET_TYPE_NOT_AVAILABLE` | 400 | Ticket type disabled |
| `MAX_PER_USER_EXCEEDED` | 422 | Exceeds maxPerUser |
| `SOLD_OUT` | 409 | No inventory |
| `INVALID_SIGNATURE` | 400 | Webhook signature invalid |
| `NOT_FOUND` | 404 | Payment/ticket/user not found |
| `FORBIDDEN` | 403 | Not owner/admin |

## Flow: Checkout

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API
    participant S as Service
    participant MP as Mercado Pago
    participant DB as PostgreSQL

    C->>API: POST /api/checkout { items, backUrl, provider }
    API->>API: auth + Zod validate
    API->>S: createCheckout(userId, items, backUrl, provider)
    S->>S: validate stock, maxPerUser
    S->>S: getProvider(provider).createCheckout()
    S->>MP: create preference
    MP-->>S: { init_point, id }
    S->>DB: createCheckoutTransaction (reserve tickets + payment)
    S-->>API: { paymentId, checkoutUrl }
    API-->>C: 201 { paymentId, checkoutUrl }
```

## Flow: Webhook

```mermaid
sequenceDiagram
    participant MP as Mercado Pago
    participant API as API
    participant S as Service
    participant DB as PostgreSQL

    MP->>API: POST /api/payments/webhook/mercadopago
    API->>S: processWebhook(payload, headers, provider)
    S->>S: getProvider(provider).verifySignature()
    S->>S: getProvider(provider).parseWebhook()
    S->>DB: findByReference()
    alt approved
        S->>DB: processPaymentWebhook()
        S->>S: generate QR for each ticket
    else declined
        S->>DB: update(payment, failed)
    end
    API-->>MP: 200 { received: true }
```

## Structure

```
payments/
  payments.controller.ts   -- Express handlers
  payments.service.ts      -- Business logic
  payments.repository.ts   -- DB access
  payments.validators.ts   -- Zod schemas
  payments.types.ts        -- Types & interfaces
  payments.routes.ts       -- Route definitions
  index.ts                 -- Module exports
  providers/               -- PaymentProvider implementations
```
