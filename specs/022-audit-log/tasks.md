# Tasks: Módulo de Auditoría

**Input**: Design documents from `/specs/022-audit-log/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests incluidos solo donde la convención del proyecto lo exige (lógica de módulo nuevo: repository/service). El resto se valida con pruebas manuales (fase Polish).

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Web app: `backend/`, `frontend/`
- Backend modules: `backend/src/modules/<name>/`
- Frontend features: `frontend/features/<domain>/` (constitución IV)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Precondiciones del entorno; sin código de feature

- [x] T001 Verificar acceso a la BD de staging (env `staging`) y que `pnpm prisma:generate` corre limpio en `backend/`
- [x] T002 Confirmar que no hay cambios de `schema.prisma` pendientes en el branch base antes de tocar el modelo

**Checkpoint**: Entorno listo para schema y migración.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Modelo `AuditLog`, módulo backend completo y endpoint. BLOCKEA todas las user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Modelo y migración

- [x] T003 Agregar `model AuditLog` en `backend/prisma/schema.prisma` según `data-model.md` (SIN `eventId` — no existe tabla `events`; con `actorRole String`, `action String`, `metadata Json?`, `@@index([createdAt, id])`, `@@index([entityType, entityId])`, FK `actor → User` con `onDelete: Restrict`)
- [ ] T004 Aplicar el cambio de schema a la BD de **staging** con la herramienta Prisma del proyecto (`pnpm prisma:generate` + migración/push) y verificar `prisma migrate status`; validar antes de producción

### Módulo `backend/src/modules/audit/`

- [x] T005 [P] Crear `audit.types.ts` en `backend/src/modules/audit/audit.types.ts` con `AuditLogInput` (actorId, actorRole, action, entityType, entityId, metadata), `AuditLogEntry` (data-model.md) y `ListAuditLogInput`
- [x] T006 [P] Crear `audit.validators.ts` en `backend/src/modules/audit/audit.validators.ts` con `listAuditLogQuerySchema` zod: `since` (ISO datetime opcional), `cursor` (string opcional), `entityType` (string opcional), `limit` (coerce int, default 50, max 100) — patrón `donaciones.schema.ts`
- [x] T007 Implementar `audit.repository.ts` en `backend/src/modules/audit/audit.repository.ts`: `create(input)` (insert simple vía Prisma) y `findMany({ since, cursor, entityType, limit })` con paginación por cursor `(createdAt, id)` e incluye `actor` (select `fullName`) para display
- [x] T008 Implementar `audit.service.ts` en `backend/src/modules/audit/audit.service.ts`: `log()` con try/catch interno que **nunca lanza** (logger.error + retorno) y `list()` que delega a `findMany` y arma `nextCursor` (null si no hay más) — research.md §4
- [x] T009 Implementar `audit.controller.ts` en `backend/src/modules/audit/audit.controller.ts` y `audit.routes.ts` en `backend/src/modules/audit/audit.routes.ts`: `GET /` con `authMiddleware` + `requireRole('super_admin')` (NO `resolveRole`, NO `visualizador`), respuesta `{ data, nextCursor, hasMore }` — contract `contracts/audit-log-api.md`
- [x] T010 Montar el router en `backend/src/app.ts`: `app.use('/api/audit-log', auditRouter)`
- [x] T011 [P] Test de `audit.repository.findMany` (cursor `(createdAt, id)`, `since`, `entityType`, `limit`) en `backend/test/audit/audit.repository.test.ts`
- [x] T012 [P] Test de `audit.service.log` (no lanza si el repository falla; insert normal) en `backend/test/audit/audit.service.test.ts`

**Checkpoint**: `GET /api/audit-log` responde solo para `super_admin`; foundation ready.

---

## Phase 3: User Story 1 - Registro automático de acciones (Priority: P1) 🎯 MVP

**Goal**: Las mutaciones de staff generan registros con quién/cuándo/qué/antes-después.

**Independent Test**: Cambio de precio de `TicketType` por `admin` deja un registro en `audit_log` con `priceBefore`/`priceAfter`.

**Notas**:
- Las acciones `discount_code.created` / `discount_code.deactivated` se **difieren**: no existe módulo/servicio de códigos de descuento en `backend/src` (solo el modelo Prisma). Se instrumentan cuando se construya ese módulo.
- `actorId`/`actorRole` vienen de `req.user` (middleware auth) en la capa service; `metadata` SIEMPRE selectivo (US4).

### Implementation for User Story 1

- [ ] T013 [P] [US1] Instrumentar `ticket_type.created` en `createTicketType` de `backend/src/modules/tickets/tickets.service.ts` (`metadata: { name, price, quantityTotal }`)
- [ ] T014 [P] [US1] Instrumentar `ticket_type.price_updated` en `updateTicketType` (solo si `price` presente) de `backend/src/modules/tickets/tickets.service.ts` (`metadata: { priceBefore, priceAfter }`)
- [ ] T015 [P] [US1] Instrumentar `ticket_type.status_updated` en `updateTicketType` (solo si `status` presente) de `backend/src/modules/tickets/tickets.service.ts` (`metadata: { statusBefore, statusAfter }`)
- [ ] T016 [P] [US1] Instrumentar `ticket.checked_in` en `checkin.service.ts` de `backend/src/modules/checkin/checkin.service.ts` al confirmar check-in (`metadata: { statusBefore, statusAfter }`)
- [ ] T017 [P] [US1] Instrumentar `ticket.cancelled` en el flujo de cancelación de tickets (ubicar: `payments.repository.ts` reclaim/expiración y/o endpoint de cancelación admin) en `backend/src/modules/payments/` o `backend/src/modules/tickets/` (`metadata: { statusBefore, statusAfter }`)
- [ ] T018 [P] [US1] Instrumentar `payment.status_changed` en cada transición de estado de `backend/src/modules/payments/payments.service.ts` (webhook `processWebhook`, `processRefund`, `createAdminPayment` — incluye pagos admin que bypasean checks) (`metadata: { statusBefore, statusAfter, totalCents }`)

**Checkpoint**: US1 complete — las 6 acciones del MVP quedan registradas con metadata selectivo.

---

## Phase 4: User Story 2 - Panel de consulta `super_admin` (Priority: P1)

**Goal**: El `super_admin` ve el historial en `app/admin/auditoria/` con auto-refresco ≤5s.

**Independent Test**: Cambio de precio de `admin` aparece en el panel sin recargar en ≤5s.

**Nota**: Ruta real es `frontend/app/admin/auditoria/` (no existe route group `(admin)`); feature en `frontend/features/audit/` (convención IV).

### Implementation for User Story 2

- [ ] T019 [P] [US2] Crear `types/index.ts` y `schemas/audit.schema.ts` en `frontend/features/audit/` (tipos `AuditLogEntry`, `AuditLogFilters`, `AuditLogResponse`; zod filters)
- [ ] T020 [P] [US2] Crear `api/audit.endpoints.ts` en `frontend/features/audit/api/audit.endpoints.ts`: `fetchAuditLog(filters)` vía `authFetch` (`@/shared/api/admin-fetch`) a `/api/audit-log` con query params `since`/`entityType`/`limit` (cursor se envía en la siguiente página si se implementa)
- [ ] T021 [P] [US2] Crear `api/audit.queries.ts` en `frontend/features/audit/api/audit.queries.ts`: hook `useAuditLog(filters)` con `queryKey: ['audit-log', filters]`, `queryFn: fetchAuditLog`, `refetchInterval: 4000` — patrón nuevo documentado en research.md §7
- [ ] T022 [P] [US2] Crear `components/AuditLogTable.tsx` en `frontend/features/audit/components/AuditLogTable.tsx`: columnas timestamp, actor, rol, acción, entidad, resumen de metadata; estado vacío y skeleton (patrón `admin-donations`); UI copy en español
- [ ] T023 [US2] Crear `page.tsx` en `frontend/app/admin/auditoria/page.tsx` renderizando `<AuditLogTable />` (solo ruta, sin lógica — constitución IV)
- [ ] T024 [US2] Implementar filtro client-side por `entityType` en `components/AuditLogTable.tsx` sobre los datos ya cargados (sin request extra en el MVP)

**Checkpoint**: US2 complete — panel funcional con polling.

---

## Phase 5: User Story 3 - Restricción de acceso (Priority: P2)

**Goal**: Solo `super_admin` accede al historial; sin acceso para el resto.

**Independent Test**: Usuario `admin`/`checker` recibe bloqueo (UI y API 403).

**Nota**: El guard de API ya quedó en Foundational (`requireRole('super_admin')`). Aquí el lado frontend. Roles: `visualizador` NO existe y NO se crea (decisión de clarificación).

### Implementation for User Story 3

- [ ] T025 [US3] Agregar `"/admin/auditoria": ["super_admin"]` a `ROLE_RESTRICTED_PATHS` en `frontend/app/admin/layout.tsx` (mecanismo de guard existente)
- [ ] T026 [P] [US3] Agregar enlace "Auditoría" con `roles: ["super_admin"]` en `frontend/shared/components/AdminSidebar.tsx` (ícono `@tabler/icons-react`)

**Checkpoint**: US3 complete — acceso restringido en UI y API.

---

## Phase 6: User Story 4 - Privacidad en metadata (Priority: P2)

**Goal**: `metadata` sin PII de compradores; solo datos mínimos (Ley 1581).

**Independent Test**: Revisión de los registros del MVP: sin payloads completos ni PII de compradores.

### Implementation for User Story 4

- [ ] T027 [US4] Revisar los 6 puntos de instrumentación (T013–T018) contra criterios Ley 1581: sin objetos completos de entidad, sin nombres/emails/cédulas de compradores; corregir cualquier desviación en `backend/src/modules/*/*.service.ts`

**Checkpoint**: US4 complete — metadata cumple la regla de privacidad.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validación integral, pruebas manuales y confirmación de criterios de aceptación

- [ ] T028 Prueba manual E2E (SC-001): `admin` cambia precio de `TicketType` → aparece en panel del `super_admin` en ≤5s sin recargar (ver `quickstart.md` §Capa 4)
- [ ] T029 Prueba manual (SC-002): usuario rol `admin` o `checker` intenta `GET /api/audit-log` y mutaciones directas → 403 por middleware (no solo oculto en UI)
- [ ] T030 Confirmar FR-008/SC-004: agregar una acción nueva (ej. `discount_code.updated` futuro) NO requiere migración — solo un string nuevo en `action` del `log()`
- [ ] T031 Revisión final de `metadata` en BD (query `audit_log` en staging) contra FR-007: sin PII fuera de excepciones definidas
- [ ] T032 Crear `README.md` breve en `backend/src/modules/audit/` (acciones auditadas + convenciones de `metadata`), siguiendo el patrón de `README.md` de otros módulos

**Checkpoint**: Todos los criterios de aceptación del spec verificados.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational
  - US1 (Phase 3) → US4 review (T027) depends on US1 instrumentation
  - US2 (Phase 4) and US3 (Phase 5) are independent of US1 and of each other
  - US4 (Phase 6) requires US1 complete
- **Polish (Final Phase)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Foundational only
- **US2 (P1)**: Foundational only (endpoint list) — independent of US1
- **US3 (P2)**: Foundational only (guard de API incluido) — independent
- **US4 (P2)**: US1 (revisa sus puntos de instrumentación)

### Within Each User Story

- Types/schemas → endpoints/API → components → integración (ruta)
- Core implementation before integration

### Parallel Opportunities

- Foundational: T005, T006, T011, T012 en paralelo (archivos distintos); T007–T010 secuenciales
- US1: T013–T018 todos en paralelo (6 services/archivos distintos)
- US2: T019–T022 en paralelo; T023/T024 después
- US3: T025, T026 en paralelo
- US4 y Polish: secuenciales al final

---

## Parallel Example: User Story 1

```bash
# Todos los puntos de instrumentación son archivos distintos — lanzar juntos:
Task: "Instrumentar ticket_type.created en backend/src/modules/tickets/tickets.service.ts"
Task: "Instrumentar ticket.checked_in en backend/src/modules/checkin/checkin.service.ts"
Task: "Instrumentar payment.status_changed en backend/src/modules/payments/payments.service.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational (CRÍTICO — bloquea todo)
3. Phase 3: US1 — registro automático (backend funcional)
4. **STOP and VALIDATE**: US1 independiente (registros en `audit_log`)

### Incremental Delivery

1. Setup + Foundational → endpoint `GET /api/audit-log` listo
2. US1 → registro automático (MVP backend)
3. US2 → panel `super_admin` con polling (MVP completo visible)
4. US3 → restricción de acceso
5. US4 → revisión de privacidad
6. Polish → criterios de aceptación verificados

### Parallel Team Strategy

1. Setup + Foundational juntos
2. Developer A: US1 (instrumentación) | Developer B: US2 (panel) | Developer C: US3 (guards UI)
3. Integrar; US4 + Polish después

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- **Desviaciones del input del usuario (justificadas)**: `eventId` omitido (no existe tabla `events`); solo `super_admin` (no `visualizador`); `requireRole` en vez de `resolveRole`; ruta `app/admin/auditoria/` no `(admin)`; acciones `discount_code.*` diferidas (módulo no existe); `ticket-types`/`discount-codes` → archivos reales `tickets.service.ts`/checkin/payments
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
