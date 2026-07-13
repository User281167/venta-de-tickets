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
| POST | `/api/admin/payments/:id/refund` | Full refund (admin) | JWT admin |
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
| `INVALID_PAYMENT_STATUS` | 409 | Refund attempted on non-completed payment |
| `REFUND_EXCEEDS_BALANCE` | 409 | Refund amount > remaining |

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

## Flow: Reembolso (Admin)

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as POST /payments/:id/refund
    participant S as Service
    participant DB as PostgreSQL

    A->>API: { reason }
    API->>S: processRefund(paymentId, reason, processedById)
    S->>DB: SELECT payment FOR UPDATE
    S->>S: validate status === 'completed'
    S->>DB: SELECT tickets WHERE payment_id = :id
    S->>DB: DELETE tickets WHERE payment_id = :id
    S->>DB: UPDATE ticket_types SET quantity_sold -= count (por cada tipo)
    S->>DB: UPDATE payments SET status = 'refunded'
    S-->>API: { paymentId, status }
    API-->>A: 201 { paymentId, status }
```

## Flow: Venta manual (Admin)

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as POST /admin/sales
    participant S as Service
    participant DB as PostgreSQL

    A->>API: { userId, ticketTypeId, quantity }
    API->>S: createAdminSale(userId, ticketTypeId, quantity)
    S->>S: validate ticket type enabled + stock
    S->>DB: $transaction (FOR UPDATE ticket_type, INSERT tickets, increment quantity_sold)
    S->>S: generate QR for each ticket
    S-->>API: [ticketId, ...]
    API-->>A: 201 { ticketIds }
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
