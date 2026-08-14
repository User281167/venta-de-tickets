# Módulo Donaciones — Recaudo Solidario

Donaciones puntuales por cuenta (`LA_CONVENCION`, `BARRANQUEROS_UTP`, `VICTIMAS`) vía proveedores de pago. Público: crear y consultar estado. Admin: listado paginado.

Cuentas (`DonationAccount`): `LA_CONVENCION` (La Convención), `BARRANQUEROS_UTP` (Barranqueros UTP), `VICTIMAS` (Víctimas y damnificados — campaña sismos Colombia).

## Rutas

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/donaciones` | Público | Crear donación (mínimo 5000 COP) → `{ initPoint, sessionId? }` |
| POST | `/api/donaciones/webhook/mercadopago-la-convencion` | Webhook | Notificación MP (La Convención) |
| POST | `/api/donaciones/webhook/mercadopago-barranqueros-utp` | Webhook | Notificación MP (Barranqueros UTP) |
| POST | `/api/donaciones/webhook/epayco-la-convencion` | Webhook | Notificación ePayco (La Convención) |
| POST | `/api/donaciones/webhook/epayco-barranqueros-utp` | Webhook | Notificación ePayco (Barranqueros UTP) |
| POST | `/api/donaciones/webhook/epayco-victimas` | Webhook | Notificación ePayco (Víctimas y damnificados) |
| GET | `/api/donaciones/:externalReference/status` | Público | Estado de una donación |
| GET | `/api/admin/donations` | admin/super_admin | Listado paginado (filtros `state`, `account`, `search`) — ruta definida en `admins.routes.ts`, manejada por este controller |

Webhooks verificados por firma (`verifyDonationsWebhookSignature`, instalado en `donaciones.routes.ts` antes del controller) y limitados por rate limit (`POLICIES.webhookGlobal`). El body llega crudo (sin `express.json`) para que el proveedor pueda verificar su HMAC.

Provider expuesto en la API pública: `epayco` (default). Los webhooks siguen aceptando `mercadopago-*` y `epayco-*` registrados en `providers/donation-provider.registry.ts`.

## Máquina de Estados

`pending → confirmed | rejected | cancelled`

- `pending`: creada, esperando webhook.
- `confirmed`: webhook `approved` (solo si estado previo es `pending` o `rejected` — permite reintento del proveedor tras un rechazo transitorio).
- `rejected`: webhook `declined` (solo desde `pending`).
- `cancelled`: sweep cron expira pendientes viejos.

Transiciones idempotentes ejecutadas en `$transaction`: se verifica estado actual y se hace `update` solo si la transición es válida. Si el webhook llega tarde sobre un estado final, no actualiza nada (se loguea warning).

## Códigos de Error

| Código | Status | Causa |
|--------|--------|-------|
| `VALIDATION_ERROR` | 422 | Monto < 5000, cuenta/provider inválidos, query de listado inválido |
| `NOT_FOUND` | 404 | `:externalReference` no existe |
| `UNAUTHORIZED` | 401 | Sin JWT (solo listado admin) |
| `FORBIDDEN` | 403 | Rol no es `admin`/`super_admin` (solo listado admin) |

## Body de Creación

```json
{
  "fullName": "string|null",        // optional
  "email":    "string|null",        // optional, email válido
  "company":  "string|null",        // optional, máx 150 chars (donante empresa/razón social)
  "amountCents": 5000,              // entero ≥ 5000
  "account":  "LA_CONVENCION|BARRANQUEROS_UTP|VICTIMAS",
  "backUrl":  "https://...",        // URL de retorno
  "provider": "epayco"              // default
}
```

Respuesta:

```json
{ "initPoint": "https://...", "sessionId": "..." }
```

## Listing Admin — Shape de Fila

```json
{
  "id": "uuid",
  "fullName": "string|null",
  "email": "string|null",
  "company": "string|null",
  "amountCents": 50000,
  "state": "pending|confirmed|rejected|cancelled",
  "account": "LA_CONVENCION|BARRANQUEROS_UTP|VICTIMAS",
  "externalReference": "DON-LA_CONVENCION-<uuid>",
  "paymentId": "string|null",
  "createdAt": "ISO",
  "updatedAt": "ISO"
}
```

## Flujo: Crear Donación

```mermaid
sequenceDiagram
    participant U as Donante
    participant API as POST /api/donaciones
    participant S as Service
    participant P as Provider
    participant DB as PostgreSQL

    U->>API: { fullName, email, company, amountCents, account, backUrl, provider }
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
