# Módulo Checkin — Validación de QR y Control de Ingreso

Validación de QR + registro de ingreso de asistentes. Maneja el caso donde el portador del QR no es el titular (confirmación remota).
Cada ticket se procesa individualmente — un comprador con N tickets = N escaneos independientes.

## Estructura del Módulo

| Archivo | Capa | Responsabilidad |
|---------|------|----------------|
| `checkin.routes.ts` | Route | `Router()` con `authMiddleware` + `requireRole('checker', 'admin')` aplicado a nivel de router |
| `checkin.controller.ts` | Controller | 4 handlers: `scan`, `confirmEntry`, `requestConfirmationHandler`, `allowEntryHandler` |
| `checkin.service.ts` | Service | 4 métodos: `scanTicket`, `confirmEntryDirect`, `requestConfirmation`, `allowEntry` |
| `checkin.repository.ts` | Repository | Transiciones con `$transaction` + `FOR UPDATE` + `WHERE status = X` (idempotencia) |
| `checkin.validators.ts` | Validator | Schemas Zod: `scanSchema`, `ticketActionSchema` |
| `checkin.types.ts` | Types | `CheckerAction`, `TicketStatus`, `TicketSummary`, `getAllowedActions()` |
| `index.ts` | Barrel | Re-exporta `checkinRouter` |

### Capa Service

| Método | Input | Output | Dependencias |
|--------|-------|--------|-------------|
| `scanTicket` | qrToken | `TicketSummary` con `allowedActions` calculadas | `jwt.verify` (QR_JWT_SECRET) + `checkinRepo.findTicketForScan` + `getAllowedActions` |
| `confirmEntryDirect` | ticketId, checkerId | void o `ConflictError` | `checkinRepo.confirmEntryDirect` |
| `requestConfirmation` | ticketId, checkerId | void o `NotFoundError`/`ConflictError` | `checkinRepo.requestConfirmation` (tx con `FOR UPDATE`) + `jwt.sign` (CONFIRMATION_JWT_SECRET) + `messagingClient.sendConfirmationLink` |
| `allowEntry` | ticketId, checkerId | void o `ConflictError` | `checkinRepo.allowEntry` |

### Capa Repository

| Método | Transacción | Locks | Transición |
|--------|-------------|-------|-----------|
| `findTicketForScan` | ninguna (read-only) | — | — |
| `confirmEntryDirect` | `$transaction` | `WHERE status = 'paid'` | `paid → used` (setea `checkedInAt` + `checkedInBy`) |
| `requestConfirmation` | `$transaction` | `FOR UPDATE` + `WHERE status = 'paid'` | `paid → pending_confirmation` (setea `confirmationRequestedAt`) |
| `allowEntry` | `$transaction` | `WHERE status = 'confirmed'` | `confirmed → used` |
| `confirmTicket` | `$transaction` | `WHERE status = 'pending_confirmation'` | `pending_confirmation → confirmed` (usado por módulo `confirmations`) |
| `rejectConfirmation` | `$transaction` | `findUnique` + `WHERE status = 'pending_confirmation'` | `pending_confirmation → paid` (con check explícito para distinguir éxito de error) |

**Regla de idempotencia**: cada transición usa `updateMany WHERE status = Z`. Si otro checker ya cambió el estado, `result.count === 0` y el controller mapea a `TICKET_NOT_AVAILABLE` (409).

## Rutas

Montadas bajo `/internal/checkin` en `app.ts`. Requieren JWT + rol `checker` o `admin`.

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/internal/checkin/scan` | Decodifica QR, devuelve ticket + acciones permitidas (read-only, idempotente) |
| POST | `/internal/checkin/confirm-entry` | `paid → used` (titular presente, ingreso directo) |
| POST | `/internal/checkin/request-confirmation` | `paid → pending_confirmation` + envía link de confirmación al comprador |
| POST | `/internal/checkin/allow-entry` | `confirmed → used` (comprador ya autorizó remotamente) |

## Códigos de Error

| Código | Status | Capa | Causa |
|--------|--------|------|-------|
| `VALIDATION_ERROR` | 422 | Controller | Body inválido (Zod) |
| `INVALID_QR` | 400 | Service | QR JWT manipulado, expirado o sin `tid` |
| `NOT_FOUND` | 404 | Service | Ticket no existe |
| `TICKET_NOT_AVAILABLE` | 409 | Service | Estado no permite la acción (incluye carrera entre dos checkers) |
| `UNAUTHORIZED` | 401 | Middleware | Sin JWT de sesión |
| `FORBIDDEN` | 403 | Middleware | Rol no es `checker` o `admin` |

## Diagrama de Secuencia — Confirmación Remota

```mermaid
sequenceDiagram
    participant A as Attendee
    participant CK as Checker
    participant API as checkin module
    participant Repo as checkin.repository
    participant DB as PostgreSQL
    participant MC as messaging module
    participant B as Buyer

    A->>CK: muestra QR
    CK->>API: POST /scan { qrToken }
    API->>Repo: findTicketForScan(ticketId)
    Repo->>DB: SELECT tickets WHERE id = ?
    DB-->>Repo: ticket
    Repo-->>API: TicketSummary
    API-->>CK: { status: 'paid', allowedActions: [...] }

    CK->>API: POST /request-confirmation { ticketId }
    API->>Repo: requestConfirmation(ticketId)
    Repo->>DB: BEGIN
    Repo->>DB: SELECT id FROM tickets WHERE id = ? FOR UPDATE
    Repo->>DB: SELECT user (fullName, email, phone)
    Repo->>DB: UPDATE tickets SET status = 'pending_confirmation' WHERE status = 'paid'
    Repo->>DB: COMMIT
    DB-->>Repo: ok
    Repo-->>API: { ok: true, buyer }
    API->>API: jwt.sign({ tid, purpose: 'confirm' })
    API->>MC: sendConfirmationLink({ ... })
    MC-->>B: email/WhatsApp con link

    B->>API: POST /confirmations/confirm { token } (en body)
    API->>Repo: confirmTicket(ticketId)
    Repo->>DB: UPDATE ... WHERE status = 'pending_confirmation'
    DB-->>Repo: ok
    Repo-->>API: true

    CK->>API: POST /scan { qrToken } (re-scan)
    API-->>CK: { status: 'confirmed', allowedActions: ['allow_entry'] }
    CK->>API: POST /allow-entry { ticketId }
    API->>Repo: allowEntry(ticketId, checkerId)
    Repo->>DB: UPDATE ... WHERE status = 'confirmed'
    Repo-->>API: true
```

## Diagrama de Secuencia — Carrera entre Checkers

```mermaid
sequenceDiagram
    participant CK1 as Checker A
    participant CK2 as Checker B
    participant API as Check-in Module
    participant DB as PostgreSQL

    par Checker A
        CK1->>API: POST /confirm-entry {ticketId}
    and Checker B
        CK2->>API: POST /confirm-entry {ticketId}
    end

    API->>DB: BEGIN
    API->>DB: SELECT ... FOR UPDATE
    Note over DB: Solo una transacción obtiene el lock
    API->>DB: UPDATE status='used' WHERE status='paid'
    DB-->>API: rows = 1
    API->>DB: COMMIT
    API-->>CK1: 200 Success

    API->>DB: BEGIN
    API->>DB: SELECT ... FOR UPDATE
    API->>DB: UPDATE status='used' WHERE status='paid'
    DB-->>API: rows = 0
    API->>DB: COMMIT
    API-->>CK2: 409 TICKET_NOT_AVAILABLE
```

## Arquitectura del Módulo

```mermaid
graph LR
    subgraph checkin
        R[checkin.routes.ts]
        C[checkin.controller.ts]
        S[checkin.service.ts]
        Repo[checkin.repository.ts]
        V[checkin.validators.ts]
        T[checkin.types.ts]
    end

    subgraph messaging
        MC[messaging.client.ts]
    end

    subgraph confirmations
        CS[confirmations.service.ts]
    end

    subgraph shared
        Auth[auth.middleware.ts]
        Role[require-role.middleware.ts]
        ConfErr[InvalidQrError]
    end

    subgraph External
        DB[(PostgreSQL<br/>tickets / users)]
    end

    R -->|authMiddleware, requireRole| Auth
    R -->|requireRole| Role
    R --> C
    C -->|Zod parse| V
    C --> S
    S -->|decodeQrToken / signConfirmationToken| T
    S -->|findTicketForScan / transitionStatus| Repo
    S -->|InvalidQrError| ConfErr
    S -->|sendConfirmationLink| MC
    CS -->|confirmTicket / rejectConfirmation| Repo
    Repo -->|prisma.ticket| DB
    Repo -->|FOR UPDATE / WHERE status| DB
```

## Dependencias entre Módulos

- `checkin → messaging` (interfaz pública `messagingClient.sendConfirmationLink`)
- `confirmations → checkin.repository` (reutiliza `confirmTicket`, `rejectConfirmation` — no duplica lógica de transición)
- `checkin.repository → confirmations` — **ninguna** (la dependencia va solo en un sentido)

## Fuera de Alcance

- Confirmar/rechazar por parte del comprador → módulo `confirmations`
- Generación del QR → módulo `tickets`
