# Modulo Checkin — Ingreso por QR

Validacion y registro de entrada de tickets via QR JWT. Endpoint bajo `/api/internal/`.

## Estructura del Módulo

| Archivo | Capa | Responsabilidad |
|---------|------|----------------|
| `checkin.routes.ts` | Route | Define endpoint con `authMiddleware` + `requireRole('checker', 'admin')` |
| `checkin.controller.ts` | Controller | Valida input (Zod), llama service, formatea respuesta |
| `checkin.service.ts` | Service | Decodifica QR JWT, orquesta repo, mapea errores |
| `checkin.repository.ts` | Repository | Transacciones Prisma sobre tabla `tickets` (cambio de estados) |
| `checkin.validators.ts` | Validator | Schema Zod para `{ qrToken }` |
| `checkin.types.ts` | Types | `CheckInResult` — unión discriminada de 6 acciones |

### Capa Service

| Método | Input | Output | Dependencias |
|--------|-------|--------|-------------|
| `checkIn` | qrToken, checkerId | `{ success, ticket }` o throw | `jwt.verify` + `checkinRepo.checkInDirect` |

### Capa Repository

| Método | Transición | Uso |
|--------|-----------|-----|
| `checkInDirect` | `paid → used` | Flujo activo — titular coincide con comprador |

> Las funciones `requestConfirmation`, `confirmTicket`, `rejectConfirmation`, `allowEntry`, `findByPendingConfirmationAndConfirmed` están definidas en el repositorio pero **no tienen caller** en service/controller/routes. Pertenecen a un flujo de confirmación pendiente que nunca se cableó.

## Rutas

| Metodo | Ruta | Descripcion | Auth |
|--------|------|-------------|------|
| POST | `/api/internal/checkin` | Validar QR y marcar ingreso | JWT checker/admin |

## Errores

| Codigo | Status | Causa |
|--------|--------|-------|
| `VALIDATION_ERROR` | 422 | QR token vacio |
| `INVALID_QR` | 400 | JWT invalido o manipulado |
| `TICKET_NOT_AVAILABLE` | 409 | Ticket ya usado / estado incorrecto |
| `NOT_FOUND` | 404 | Ticket no existe |
| `UNAUTHORIZED` | 401 | JWT faltante |
| `FORBIDDEN` | 403 | Rol no es checker/admin |

## Request

```json
{
  "qrToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Response 200

```json
{
  "success": true,
  "ticket": { "id": "uuid" }
}
```

## Response 409

```json
{
  "error": {
    "code": "TICKET_NOT_AVAILABLE",
    "message": "Ticket is already checked in"
  }
}
```

## Flujo: Check-in Directo

```mermaid
sequenceDiagram
    participant S as Scanner
    participant API as API
    participant SV as Service
    participant R as Repository
    participant DB as PostgreSQL

    S->>API: POST /api/internal/checkin { qrToken }
    API->>API: auth + role checker/admin
    API->>SV: checkIn(qrToken, checkerId)
    SV->>SV: jwt.verify(qrToken, QR_JWT_SECRET)
    alt JWT invalido
        SV-->>API: throw INVALID_QR
        API-->>S: 400 INVALID_QR
    end
    SV->>R: checkInDirect(ticketId, checkerId)
    R->>DB: SELECT ... FOR UPDATE
    alt ticket not found
        R-->>SV: not_found
        SV-->>API: throw NOT_FOUND
        API-->>S: 404 NOT_FOUND
    else already used
        R-->>SV: already_used
        SV-->>API: throw TICKET_NOT_AVAILABLE
        API-->>S: 409 TICKET_NOT_AVAILABLE
    else wrong status
        R-->>SV: wrong_status
        SV-->>API: throw TICKET_NOT_AVAILABLE
        API-->>S: 409 TICKET_NOT_AVAILABLE
    else success
        R->>DB: UPDATE status='used'
        R-->>SV: entered
        SV-->>API: { success: true, ticket }
        API-->>S: 200 { success: true }
    end
```

## Arquitectura del Módulo

```mermaid
graph LR
    subgraph Route
        R[checkin.routes.ts]
    end
    subgraph Controller
        C[checkin.controller.ts]
    end
    subgraph Service
        S[checkin.service.ts]
    end
    subgraph Repository
        Repo[checkin.repository.ts]
    end
    subgraph External
        DB[(PostgreSQL<br/>tickets)]
    end

    R -->|authMiddleware + requireRole| C
    C -->|Zod validation| C
    C -->|delega| S
    S -->|jwt.verify| S
    S -->|checkInDirect| Repo
    Repo -->|Prisma raw SQL| DB
```
