# Módulo Donaciones — Recaudo Solidario

Donaciones puntuales por cuenta (`LA_CONVENCION`, `BARRANQUEROS_UTP`) vía proveedores de pago. Público: crear y consultar estado. Admin: listado paginado.

## Rutas

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/donaciones` | Público | Crear donación (mínimo 5000 COP) → devuelve `initPoint` |
| POST | `/api/donaciones/webhook/mercadopago-la-convencion` | Webhook | Notificación MP (La Convención) |
| POST | `/api/donaciones/webhook/mercadopago-barranqueros-utp` | Webhook | Notificación MP (Barranqueros UTP) |
| POST | `/api/donaciones/webhook/epayco-la-convencion` | Webhook | Notificación ePayco (La Convención) |
| POST | `/api/donaciones/webhook/epayco-barranqueros-utp` | Webhook | Notificación ePayco (Barranqueros UTP) |
| GET | `/api/donaciones/:externalReference/status` | Público | Estado de una donación |
| GET | `/api/admin/donations` | admin/super_admin | Listado paginado (filtros `state`, `account`, `search`) — ruta definida en `admins.routes.ts`, manejada por este controller |

Webhooks verificados por firma (`donation-webhook-signature.middleware`) y limitados por rate limit. El body llega crudo para que el proveedor pueda verificar su HMAC.

## Máquina de Estados

`pending → confirmed | rejected | cancelled`

- `pending`: creada, esperando webhook.
- `confirmed`: webhook `approved` (solo si estado previo es `pending`/`rejected`).
- `rejected`: webhook `declined` (solo desde `pending`).
- `cancelled`: sweep cron expira pendientes viejos.

Transiciones idempotentes: `updateMany WHERE state = esperado`. Si el webhook llega tarde sobre un estado final, no actualiza nada (se loguea warning).

## Códigos de Error

| Código | Status | Causa |
|--------|--------|-------|
| `VALIDATION_ERROR` | 422 | Monto < 5000, cuenta/provider inválidos, query de listado inválido |
| `NOT_FOUND` | 404 | `:externalReference` no existe |
| `UNAUTHORIZED` | 401 | Sin JWT (solo listado admin) |
| `FORBIDDEN` | 403 | Rol no es `admin`/`super_admin` (solo listado admin) |

## Flujo: Crear Donación

```mermaid
sequenceDiagram
    participant U as Donante
    participant API as POST /api/donaciones
    participant S as Service
    participant P as Provider
    participant DB as PostgreSQL

    U->>API: { fullName, email, amountCents, account, backUrl, provider }
    API->>API: validar monto >= 5000, cuenta, provider
    S->>S: generateExternalReference (DON-{account}-uuid)
    S->>P: createPreference(externalReference, amount, backUrl)
    P-->>S: { initPoint }
    S->>DB: INSERT donation (pending)
    S-->>API: { initPoint }
    API-->>U: 201
```

## Flujo: Webhook de Confirmación

```mermaid
sequenceDiagram
    participant P as Provider
    participant API as POST /webhook/:provider
    participant S as Service
    participant DB as PostgreSQL
    participant MS as messaging

    P->>API: payload + headers
    API->>API: verifySignature
    alt firma inválida
        API-->>P: 200 (ignora, no responde error)
    end
    API->>S: handleWebhook(provider, payload, headers)
    S->>S: parseWebhook → { status, reference, externalId }
    S->>S: mapWebhookStatus (approved→confirmed, declined→rejected)
    alt status no mapeable (pending)
        S-->>API: retorna sin persistir
    end
    S->>DB: updateStateByExternalReference (WHERE state esperado)
    alt filas = 0
        DB-->>S: nada (estado final, webhook tardío)
    else filas = 1
        S->>DB: findByExternalReference
        alt confirmed
            S->>MS: notifyDonationConfirmed [fire-and-forget]
        else rejected
            S->>MS: notifyDonationRejected [fire-and-forget]
        end
    end
    API-->>P: 200 { status: 'processed' }
```

## Arquitectura

```mermaid
graph LR
    subgraph donaciones
        R[donaciones.routes.ts]
        C[donaciones.controller.ts]
        S[donaciones.service.ts]
        Repo[donaciones.repository.ts]
        Reg[providers/donation-provider.registry.ts]
    end
    subgraph providers
        MP[MercadoPagoDonationProvider]
        EP[EpaycoDonationProvider]
    end
    subgraph messaging
        NOT[donation-notifications]
    end
    subgraph admins
        AR[admins.routes.ts]
    end
    subgraph External
        DB[(PostgreSQL<br/>donation)]
        API_MP[Mercado Pago API]
        API_EP[ePayco API]
    end

    R --> C
    AR -->|delega listDonations| C
    C --> S
    S -->|createPreference / webhook| Reg
    S -->|CRUD + expirePending| Repo
    S -->|notify*| NOT
    Reg -->|instancia| MP
    Reg -->|instancia| EP
    MP -->|HTTP| API_MP
    EP -->|HTTP| API_EP
    Repo -->|Prisma| DB
```
