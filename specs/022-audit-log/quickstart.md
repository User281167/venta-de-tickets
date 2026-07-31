# Quickstart: Módulo de Auditoría

**Branch**: `022-audit-log` | **Date**: 2026-07-31

Guía de desarrollo y verificación por capas. Trabajo incremental:
schema → API → UI (constitución).

## Requisitos previos

- Node + `pnpm` (packageManager `pnpm@10.33.0`).
- `.env` del backend con acceso a Supabase (Postgres).

## Capa 1 — Schema (backend)

1. Agregar `model AuditLog` en `backend/prisma/schema.prisma` (definición en `data-model.md`).
2. Regenerar cliente Prisma y aplicar el esquema a la BD con la herramienta Prisma que ya usa el proyecto.
3. Verificar:

```bash
cd backend
pnpm prisma:generate
```

## Capa 2 — Módulo backend `src/modules/audit/`

Archivos a crear (patrón de `donaciones`/`tickets`):

```
src/modules/audit/
├── audit.types.ts         # AuditLogInput, AuditLogEntry, ListAuditLogInput
├── audit.validators.ts    # zod: listAuditLogQuerySchema (since, cursor, entityType, limit)
├── audit.repository.ts    # create(), list() — Prisma, con joins actor
├── audit.service.ts       # log() (try/catch, nunca lanza) + list()
├── audit.controller.ts    # parseo/validación de query, respuesta { data, nextCursor, hasMore }
└── audit.routes.ts        # GET /  authMiddleware + requireRole('super_admin')
```

Registrar en `backend/src/app.ts`:

```ts
app.use('/api/audit-log', auditRouter);
```

### Verificación backend

```bash
cd backend
pnpm lint
pnpm test          # vitest run
pnpm dev           # prueba manual con curl
```

Prueba manual:

```bash
# crear un registro manual para probar el endpoint
curl -H "Authorization: Bearer <token-super-admin>" "http://localhost:4000/api/audit-log?limit=10"
curl -H "Authorization: Bearer <token-super-admin>" "http://localhost:4000/api/audit-log?entityType=TicketType"
# 403 esperado con token de rol admin/checker/client
```

## Capa 3 — Instrumentación de mutaciones existentes

En cada service, después del commit de la mutación y con el `req.user` a mano:

```ts
await auditService.log({
  actorId: currentUser.id,
  actorRole: currentUser.role,
  action: 'ticket_type.price_updated',
  entityType: 'TicketType',
  entityId: updated.id,
  metadata: { priceBefore, priceAfter },
});
```

Puntos de inserción: `tickets.service.ts` (`createTicketType`, `updateTicketType`),
flujo de cancelación y check-in, `payments.service.ts` (webhook/refund/admin payment),
y el módulo de códigos de descuento (ubicación exacta en `tasks.md`).

Verificar con un test Vitest por service instrumentado: mutación exitosa
produce registro; fallo de auditoría no revierte la mutación.

## Capa 4 — Frontend

```
frontend/features/audit/
├── api/audit.endpoints.ts    # fetchAuditLog(filters) vía authFetch
├── api/audit.queries.ts      # useAuditLog(filters) con refetchInterval: 4000
├── components/AuditLogTable.tsx
├── types/index.ts
└── schemas/audit.schema.ts   # zod: AuditLogFilters

frontend/app/admin/auditoria/page.tsx   # render <AuditLogTable />
```

Ajustes:

- `frontend/app/admin/layout.tsx`: `ROLE_RESTRICTED_PATHS["/admin/auditoria"] = ["super_admin"]`.
- `frontend/shared/components/AdminSidebar.tsx`: enlace "Auditoría", `roles: ["super_admin"]`.

### Verificación frontend

```bash
cd frontend
pnpm lint
pnpm build
pnpm dev
```

Criterio de aceptación E2E manual (SC-001): con `admin` y `super_admin` en
pestañas distintas, cambiar precio de un tipo de entrada → el panel de
auditoría del `super_admin` muestra el cambio en ≤5s sin recargar.

## Gates de revisión

- [ ] `metadata` sin PII de compradores en todos los registros del MVP (FR-007/SC-003).
- [ ] Acciones nuevas auditan sin migración (FR-008): basta agregar un `action` string nuevo.
- [ ] Fallo de `log()` no rompe la mutación (FR-009/SC-005).
- [ ] Endpoint inaccesible para roles ≠ `super_admin` (FR-005/SC-002).
