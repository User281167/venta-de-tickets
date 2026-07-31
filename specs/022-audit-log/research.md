# Research: Módulo de Auditoría

**Branch**: `022-audit-log` | **Date**: 2026-07-31

Resolución de incógnitas técnicas del Technical Context, con base en el
código real del repositorio.

## 1. `eventId` y tabla `Event`

**Contexto**: El plan de entrada y el spec proponen `AuditLog.eventId FK → Event`. El evento es único y su nombre está hardcodeado (`'La Convención De Egresados UTP 2026'` en `backend/src/modules/messaging/messaging.service.ts:6`).

**Hallazgo**: **No existe tabla `events` en el proyecto.** Verificado:
- `backend/prisma/schema.prisma`: sin modelo `Event` (solo User, EgresadosList, PrivacyAcceptance, TicketType, DiscountCode, Ticket, Payment, Donation).
- Grep de `event|Event` en `backend/src` y `backend/prisma`: solo coincidencias de webhook (`NormalizedWebhookEvent`), ninguna tabla de eventos.
- Sin carpeta de migraciones en `backend/prisma/` (solo `schema.prisma` y `seed.ts`).

**Decision**: Omitir `eventId` en el MVP. El modelo `AuditLog` queda sin FK a evento; si en el futuro existe tabla `events` multi-evento, se agrega la columna con migración (la tabla ya está diseñada para admitirlo sin cambios de código de lectura).

**Rationale**: Una FK a una tabla inexistente rompe `prisma migrate`/`prisma db push`. Crear tabla `Event` solo para esta FK es scope creep y contradice el sistema actual de evento único. El requisito del spec (asociar registros al evento activo) es redundante mientras exista un solo evento.

**Alternatives considered**:
- Crear tabla `Event` + poblar: descartado — abstracción nueva sin necesidad concreta (constitución: simplicidad sobre pureza).
- Guardar `eventId String?` nullable sin FK: descartado — columna muerta con valores vacíos.

**Riesgo residual**: Si llega multi-evento, hay que agregar columna + backfill + nuevo campo en el payload. Documentado en `data-model.md`.

## 2. Middleware de autorización

**Contexto**: El plan de entrada usa `resolveRole(['super_admin'])`.

**Hallazgo**: El middleware real es `requireRole(...roles)` en `backend/src/shared/middlewares/require-role.middleware.ts`, usado en `checkin.routes.ts` y `admins.routes.ts`. No existe `resolveRole`.

**Decision**: Usar `requireRole('super_admin')` en `audit.routes.ts`, precedido por `authMiddleware`.

**Rationale**: Reutilizar el mecanismo existente; cero abstracciones nuevas.

## 3. Rol `visualizador`

**Contexto**: El plan de entrada menciona "agregando `visualizador` a los roles permitidos de esta ruta" y valida riesgo de enum `UserRole`.

**Hallazgo**: El rol `visualizador` NO existe (`enum UserRole { super_admin admin checker client }`). La clarificación Q1 del spec resolvió **Opción A**: solo `super_admin` lee auditoría.

**Decision**: NO crear el rol `visualizador`. Sin cambio de enum → el riesgo técnico de downtime por migración de enum desaparece.

**Rationale**: Consistencia con spec aprobado; evita migración y cambios en la validación de roles de admins.

## 4. Fire-and-forget vs `await` en `AuditService.log()`

**Contexto**: El plan de entrada deja a tasks decidir si `log()` se espera o se dispara sin esperar.

**Decision**: `await auditService.log(...)` después del commit de la mutación.

**Rationale**: `log()` envuelve el insert en try/catch interno que nunca lanza → el `await` es seguro y no afecta la transacción principal (no hay transacción abierta: se llama después del commit). Ventaja: el registro es durable antes de responder, sin necesidad de manejo de unhandled rejection. A diferencia de `messaging` (I/O externo lento), el insert local es de ~1 ms.

**Alternatives considered**: fire-and-forget sin `await` — descartado: exige gestión de rechazos no capturados y no garantiza durabilidad al responder.

## 5. Paginación por cursor

**Contexto**: `GET /audit-log` con `since`, `cursor`, `entityType`, `limit` (default 50, max 100).

**Decision**: Cursor compuesto `(createdAt, id)` codificado. `since` (polling incremental) se implementa como filtro `createdAt > since`; el cursor de página siguiente se calcula sobre `createdAt` del último registro con `id` como desempate (timestamps de igual valor). Respuesta `{ data, nextCursor: string | null }`.

**Rationale**: Evita duplicados/saltos cuando llegan registros nuevos durante polling (offset no lo garantiza). Índice `@@index([createdAt, id])` soporta la consulta.

**Alternatives considered**: solo `createdAt` como cursor — descartado por colisiones de timestamp; offset — descartado por inestabilidad en lista en vivo.

## 6. Ubicación del módulo y convenciones

**Contexto**: El plan de entrada propone `app/(admin)/auditoria/` y archivos sueltos `useAuditLog.ts`/`AuditLogTable.tsx`.

**Hallazgo**: El panel admin es `app/admin/` (sin route group `(admin)`); la convención frontend es `features/<domain>/{api,components,hooks,schemas,types}` (constitución IV; ej. `admin-donations`). Los componentes llaman funciones de `features/*/api/*.client.ts`/`*.endpoints.ts`, nunca fetch directo. Backend usa `admin-fetch` (`@/shared/api/admin-fetch`) para endpoints autenticados.

**Decision**:
- Ruta: `frontend/app/admin/auditoria/page.tsx`.
- Feature: `frontend/features/audit/` con `api/audit.endpoints.ts` + `api/audit.queries.ts` (hook `useAuditLog` con `refetchInterval: 4000`), `components/AuditLogTable.tsx`, `types/index.ts`, `schemas/audit.schema.ts`.
- Guard de ruta: agregar `"/admin/auditoria": ["super_admin"]` a `ROLE_RESTRICTED_PATHS` en `frontend/app/admin/layout.tsx` (patrón existente).
- Nav: entrada en `AdminSidebar.tsx` con `roles: ["super_admin"]`.

**Rationale**: Consistencia con estructura existente; el guard del layout ya es el mecanismo usado para `ticket-types`/`usuarios`.

## 7. Patrón polling frontend

**Contexto**: El spec dice "mismo patrón que `confirmations`" con `refetchInterval: 3000–5000`.

**Hallazgo**: No existe `refetchInterval` en el frontend actual (grep: 0 coincidencias). El patrón de polling no está implementado todavía.

**Decision**: El módulo de auditoría establece el patrón: `useQuery({ queryKey: ['audit-log', filters], queryFn, refetchInterval: 4000 })`. Se documenta como patrón de referencia; sin dependencia de código previo.

**Rationale**: Requisito del spec (auto-refresco ≤5s). 4000ms está dentro del rango 3–5s.

## 8. Filtro por `entityType`

**Decision**: `entityType` se envía como query param opcional al backend (ya soportado por el endpoint) y, en paralelo, el frontend puede filtrar client-side. Con volumen bajo (~2000 asistentes), el filtro client-side basta; el backend ya lo soporta sin cambios.

**Rationale**: El spec exige filtro; la ruta de menor código es filtrar sobre la página actual traída por el polling; si crece el volumen se activa el query param.

## Consolidado de decisiones

| # | Tema | Decisión |
|---|------|----------|
| 1 | `eventId` | Omitir (no existe tabla `Event`) |
| 2 | Middleware | `requireRole('super_admin')` + `authMiddleware` |
| 3 | Rol `visualizador` | NO se crea; solo `super_admin` |
| 4 | `log()` | `await` después del commit; try/catch interno que nunca lanza |
| 5 | Paginación | Cursor `(createdAt, id)`; `since` como `createdAt > since` |
| 6 | Ubicación | `app/admin/auditoria/` + `features/audit/` |
| 7 | Polling | `refetchInterval: 4000` (patrón nuevo, documentado) |
| 8 | Filtro entityType | Query param backend + filtro client-side |
