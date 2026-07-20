# Payments Module — Multi-Provider Payment Processor

Checkout, webhook, payment status, and admin sale endpoints.
Núcleo transaccional del sistema. Usa **raw SQL** en el repositorio (no Prisma queries) para control fino de transacciones, locks y atomicidad.

## Estructura del Módulo

| Archivo | Capa | Responsabilidad |
|---------|------|----------------|
| `payments.routes.ts` | Route | 3 rutas propias + delegación a admins/me |
| `payments.controller.ts` | Controller | Valida Zod, delega a service |
| `payments.service.ts` | Service | Orquesta validación stock + provider externo + repo transaccional |
| `payments.repository.ts` | Repository | **Raw SQL** + `$transaction` con `FOR UPDATE`, sweep, reclaim, refund |
| `payments.validators.ts` | Validator | Schemas Zod para checkout, status, pagination |
| `payments.types.ts` | Types | `PaymentProvider` interface, `CheckoutInput/Result`, `NormalizedWebhookEvent` |
| `providers/` | Adapter | Implementaciones de `PaymentProvider` por proveedor |

### Capa Service

| Método | Input | Output | Transacciones clave |
|--------|-------|--------|---------------------|
| `createCheckout` | userId, items, backUrl, provider | `{ paymentId, checkoutUrl, preferenceId }` | **User validation → DB→Provider**: verifica usuario existe + completo (cedula/fullName), reserva atómica en DB, llama proveedor externo. Si provider falla, expiran solos vía sweep |
| `processWebhook` | payload, headers, provider | `{ received: true }` | Verifica firma, parsea evento, maneja approved/declined/expired-reclaim |
| `listMyPayments` | userId, page, limit | `{ data, total, page, limit }` | Consulta simple |
| `listAllPayments` | filters | `{ data, total, page, limit }` | Filtros admin (status, fechas, búsqueda) |
| `getPaymentDetail` | paymentId | Payment con user + tickets | Admin |
| `getPaymentStatus` | paymentId, userId, role | Payment + tickets con QR | Owner/admin |
| `createAdminPayment` | userId, provider, tickets, adminId | `{ paymentId, ticketIds }` | **Transacción completa**: bypass stock check, INSERT payment+tickets, genera QR |
| `processRefund` | paymentId, reason, processedById | `{ paymentId, status }` | **Transacción**: FOR UPDATE, revierte stock, marca tickets cancelled, payment refunded |

### Capa Repository — Transacciones

| Método | Transacción | Locks | Paso a paso |
|--------|------------|-------|-------------|
| `createCheckoutReservation` | `$transaction` | `FOR UPDATE` sobre ticket_types | ① Sweep expirados ② Validar stock + maxPerUser + descontar quantity_sold ③ INSERT payment pending ④ INSERT tickets reserved |
| `processPaymentWebhook` | `$transaction` | Optimista (WHERE status check) | ① UPDATE payment → completed ② UPDATE tickets → paid |
| `reclaimExpiredPayment` | `$transaction` | `FOR UPDATE` payment + ticket_types (sorted) | ① Verificar payment sigue expired ② Bloquear ticket_types orden estable ③ Verificar cupo (todo o nada) ④ Re-stock + tickets paid + payment completed |
| `refundTransaction` | `$transaction` | `FOR UPDATE` payment | ① Verificar completed/completed_unfulfillable ② Revertir stock solo tickets paid/confirmed ③ Tickets → cancelled ④ Payment → refunded + metadata refund |
| `createAdminPaymentTransaction` | `$transaction` | `FOR UPDATE` ticket_types | ① Por cada item: validar cupo, descontar stock, INSERT tickets paid ② INSERT payment completed |
| `sweepExpiredReservations` | `$transaction` | `FOR UPDATE` implícito | ① UPDATE tickets expired + revert stock ② UPDATE payments → expired |

### Capa Repository — Consultas

| Método | Query | Uso |
|--------|-------|-----|
| `findByReference` / `findByProviderTxId` | `findUnique` / `findFirst` por id/txId | Webhook lookup |
| `findByIdWithTickets` | `findUnique` + include tickets | Status + detail |
| `findAllByUserId` / `countByUserId` | `findMany` / `count` por userId | Historial cliente |
| `findAllPaymentsFiltered` / `countAllPaymentsFiltered` | `findMany` / `count` con filtros | Listado admin |
| `findPaymentByIdWithUser` | `findUnique` + include user + tickets + ticketType | Detalle admin |
| `markUnfulfillable` | `update` status | Reclaim fallido |

## Routes

### Propias

Montadas en `payments.routes.ts`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/payments/checkout` | JWT user | Crear sesión de pago |
| POST | `/api/payments/webhook/:provider` | Public | Webhook del proveedor |
| GET | `/api/payments/:id/status` | JWT owner/admin | Estado del pago + tickets |

### Delegadas desde admin

Montadas en `admins.routes.ts` bajo `/api/admin/payments`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/payments` | JWT admin | Listar pagos con filtros |
| GET | `/api/admin/payments/:id` | JWT admin | Detalle pago + user + tickets |
| POST | `/api/admin/payments/manual` | JWT admin | Pago manual/gift + tickets |
| POST | `/api/admin/payments/:id/refund` | JWT admin | Reembolso completo |

### Delegadas desde me

Montadas en `me.routes.ts` bajo `/api/me/payments`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/me/payments` | JWT client | Historial de pagos del cliente |

## Errors

| Code | Status | Layer | Cause |
|------|--------|-------|-------|
| `VALIDATION_ERROR` | 422 | Controller | Invalid request data (Zod) |
| `USER_NOT_FOUND` | 422 | Service | User not found (checkout) |
| `USER_INFO_INCOMPLETE` | 422 | Service | User missing cedula/fullName (checkout) |
| `TICKET_TYPE_NOT_FOUND` | 404 | Repo (tx) | Ticket type UUID no existe |
| `TICKET_TYPE_NOT_AVAILABLE` | 400 | Service/Repo | Ticket type disabled |
| `INVALID_QUANTITY` | 422 | Service | Quantity ≤ 0 |
| `MAX_PER_USER_EXCEEDED` | 422 | Repo (tx) | Exceeds maxPerUser (incluye tickets ya adquiridos) |
| `SOLD_OUT` | 409 | Repo (tx) | No inventory en el momento de la reserva |
| `INVALID_SIGNATURE` | 400 | Service | Webhook signature verification failed |
| `NOT_FOUND` | 404 | Service/Repo | Payment/ticket/user not found |
| `FORBIDDEN` | 403 | Service | Not owner/admin |
| `INVALID_PAYMENT_STATUS` | 409 | Repo (tx) | Refund attempted on non-completed payment |

## Diagrama de Transacciones

### Checkout (DB primero, provider después)

```mermaid
sequenceDiagram
    participant C as Client
    participant API as POST /checkout
    participant S as Service
    participant MR as me.repository
    participant Tx as DB Transaction
    participant P as Provider

    C->>API: { items, backUrl, provider }
    API->>S: createCheckout(userId, items, backUrl, provider)
    S->>MR: findByUserId(userId)
    MR-->>S: user || null
    alt user not found
        S-->>API: 422 USER_NOT_FOUND
    else missing cedula/fullName
        S-->>API: 422 USER_INFO_INCOMPLETE
    end
    Note over S: validateTicketType (stock, maxPerUser)
    S->>Tx: createCheckoutReservation(paymentId, userId, items)
    Tx->>Tx: sweepExpired first
    Tx->>Tx: FOR UPDATE ticket_types
    Tx->>Tx: validate stock + maxPerUser again
    Tx->>Tx: UPDATE quantity_sold += quantity
    Tx->>Tx: INSERT payment (pending)
    Tx->>Tx: INSERT tickets (reserved)
    Tx-->>S: { paymentId }
    S->>P: provider.createCheckout()
    P-->>S: { checkoutUrl, providerTxId }
    S-->>API: { paymentId, checkoutUrl, preferenceId }
    API-->>C: 201
    Note over S: Si provider falla → tickets expiran solos vía sweep cron
```

### Webhook — Approved

```mermaid
sequenceDiagram
    participant MP as Mercado Pago
    participant API as POST /webhook/:provider
    participant S as Service
    participant Tx as DB Transaction
    participant TS as ticketsService

    MP->>API: payload + headers
    API->>S: processWebhook(payload, headers, provider)
    S->>S: verifySignature()
    S->>S: parseWebhook()
    S->>S: findByReference()
    alt payment expired (late webhook)
        S->>Tx: reclaimExpiredPayment()
        Tx->>Tx: FOR UPDATE payment + ticket_types
        Tx->>Tx: verify stock available (all-or-nothing)
        Tx->>Tx: re-stock + tickets → paid + payment → completed
        Tx-->>S: { outcome: 'reclaimed', ticketIds }
        S->>TS: generateQrForTicket (por cada ticket)
    else payment pending
        S->>Tx: processPaymentWebhook()
        Tx->>Tx: UPDATE payment → completed (WHERE status=pending)
        Tx->>Tx: UPDATE tickets → paid
        Tx-->>S: { processed: true }
        S->>TS: generateQrForTicket (por cada ticket)
    end
    API-->>MP: 200 { received: true }
```

### Refund

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as POST /payments/:id/refund
    participant S as Service
    participant Tx as DB Transaction

    A->>API: { reason }
    API->>S: processRefund(paymentId, reason, adminId)
    S->>Tx: refundTransaction()
    Tx->>Tx: SELECT payment FOR UPDATE
    Tx->>Tx: validate status in (completed, completed_unfulfillable)
    Tx->>Tx: SELECT tickets WHERE payment_id
    Tx->>Tx: revert stock (solo paid/confirmed/pending_confirmation)
    Tx->>Tx: UPDATE tickets → cancelled (except used/expired)
    Tx->>Tx: UPDATE payment → refunded + metadata
    Tx-->>S: { paymentId, status: 'refunded' }
    S-->>API: 201
    API-->>A: { paymentId, status: 'refunded' }
```

## Arquitectura del Módulo

```mermaid
graph LR
    subgraph payments
        R[payments.routes.ts]
        C[payments.controller.ts]
        S[payments.service.ts]
        Repo[payments.repository.ts]
        Reg[provider.registry.ts]
    end

    subgraph providers
        MP[MercadoPagoProvider]
    end

    subgraph consumers
        R2[admins.routes.ts]
        ADM[admins.controller.ts]
        R3[me.routes.ts]
        ME[me.routes.ts]
    end

    subgraph tickets
        TS[tickets.service.ts]
    end

    subgraph me
        MR[me.repository.ts]
    end

    subgraph External
        DB[(PostgreSQL<br/>payments / tickets / ticket_types)]
        API_MP[Mercado Pago API]
    end

    R -->|auth| C
    R2 -->|delega| ADM
    R3 -->|delega| ME

    C -->|delega| S

    S -->|createCheckoutReservation| Repo
    S -->|processWebhook| Repo
    S -->|getProvider| Reg
    Reg -->|instancia| MP
    MP -->|HTTP| API_MP

    S -->|validate user| MR
    S -->|generateQrForTicket| TS

    Repo -->|raw SQL + transaction| DB

    ADM -->|listAllPayments| S
    ADM -->|getPaymentDetail| S
    ME -->|listMyPaymentsHandler| C
```
