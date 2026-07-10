# Modulo Payments — Procesador de Pagos Multi-Provider

Checkout, webhook y consulta de pagos. Endpoints bajo `/api/`.

## Rutas

| Metodo | Ruta | Descripcion | Auth |
|--------|------|-------------|------|
| POST | `/api/checkout` | Crear sesion de pago | JWT usuario |
| POST | `/api/payments/webhook/:provider` | Webhook del provider | Publico |
| GET | `/api/payments/:id/status` | Estado del pago + tickets | JWT owner/admin |

## Errores

| Codigo | Status | Causa |
|--------|--------|-------|
| `VALIDATION_ERROR` | 422 | Datos invalidos (Zod) |
| `TICKET_TYPE_NOT_AVAILABLE` | 400 | Tipo ticket deshabilitado |
| `MAX_PER_USER_EXCEEDED` | 422 | Excede maxPerUser |
| `SOLD_OUT` | 409 | Sin inventario |
| `INVALID_SIGNATURE` | 400 | Firma webhook invalida |
| `NOT_FOUND` | 404 | Payment no encontrado |
| `FORBIDDEN` | 403 | No es owner/admin |

## Flujo: Checkout

```mermaid
sequenceDiagram
    participant C as Cliente
    participant API as API
    participant S as Service
    participant MP as Mercado Pago
    participant DB as PostgreSQL

    C->>API: POST /api/checkout { items, backUrl, provider }
    API->>API: auth + validar Zod
    API->>S: createCheckout(userId, items, backUrl, provider)
    S->>S: validar stock, maxPerUser
    S->>S: getProvider(provider).createCheckout()
    S->>MP: crear preferencia
    MP-->>S: { init_point, id }
    S->>DB: createCheckoutTransaction (reservar tickets + payment)
    S-->>API: { paymentId, checkoutUrl }
    API-->>C: 201 { paymentId, checkoutUrl }
```

## Flujo: Webhook

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

## Estructura

```
payments/
  routes/            -- definiciones de rutas Express
  controllers/       -- handlers Express
  services/          -- logica de negocio
  repositories/      -- acceso a DB
  validators/        -- esquemas Zod
  types/             -- tipos e interfaces
  providers/         -- implementaciones de PaymentProvider
```
