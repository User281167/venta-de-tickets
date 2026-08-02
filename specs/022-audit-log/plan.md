# Implementation Plan: Módulo de Auditoría

**Branch**: `022-audit-log` | **Date**: 2026-07-31 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/022-audit-log/spec.md`

## Summary

Registrar acciones de mutación del personal (admin/checker) sobre entidades
del negocio (tipos de ticket, tickets, pagos, códigos de descuento) en una
tabla única `audit_log`, y exponerlas de solo lectura al rol `super_admin`
vía endpoint con paginación por cursor y panel con polling (TanStack Query),
sin Realtime. El servicio de auditoría es no bloqueante: un fallo al
registrar nunca afecta la mutación principal.

## Technical Context

**Language/Version**: TypeScript (backend Express 5 + ESM con `tsx`; frontend Next.js App Router). TS ^6.0.3 / TS en frontend.

**Primary Dependencies**: Backend: `@prisma/client` + `@prisma/adapter-pg` (Prisma 7), `zod` ^4.4.3, `pino` (logger en `src/utils/logger.ts`). Frontend: `@tanstack/react-query`, Chakra UI, `@tabler/icons-react`, `authFetch` (`@/shared/api/admin-fetch`).

**Storage**: PostgreSQL vía Supabase, accedida solo con Prisma Client dentro de `*.repository.ts` (regla de la constitución). Tabla nueva `audit_log`.

**Testing**: Vitest (backend, `backend/test/<modulo>/`). Frontend sin framework de test unitario; E2E Playwright no aplica para panel interno.

**Target Platform**: Railway (backend) + Vercel/Next (frontend) — navegador desktop/mobile, panel admin.

**Project Type**: Web app monorepo: backend API + frontend Next.js.

**Performance Goals**: Polling de auditoría cada 4s; respuesta del endpoint < 200ms p95 con volumen bajo (~2000 asistentes, pocos admins).

**Constraints**:
- Solo `super_admin` lee auditoría (decisión de clarificación A; rol `visualizador` NO existe y NO se crea).
- Sin Supabase Realtime / channels / `postgres_changes` — polling únicamente.
- `metadata` selectivo, sin PII de compradores (Ley 1581).
- Sin borrado físico de usuarios (convención del sistema): FK `actor` con `onDelete: Restrict`.
- NO hay tabla `Event` en el schema de Prisma: se omite `eventId` (ver research.md — desviación justificada del plan de entrada).
- No existe middleware `resolveRole`; el real es `requireRole(...roles)` en `backend/src/shared/middlewares/require-role.middleware.ts`.

**Scale/Scope**: 1 tabla, 1 módulo backend (`src/modules/audit/`), 1 endpoint, 1 página admin (`app/admin/auditoria/`), instrumentación de 4 servicios existentes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Verificación |
|-----------|--------|--------------|
| I. Layered Architecture | ✔ Pasa | `controller → service → repository`; service no importa Express/Supabase; Prisma solo en `audit.repository.ts` |
| II. Vertical Module Boundaries | ✔ Pasa | Módulo propio `src/modules/audit/`; `AuditService.log()` se llama desde otros services, nunca repos cruzados |
| III. WhatsApp Bot Separate | ✔ N/A | Sin relación |
| IV. Frontend Feature-Based | ✔ Pasa | Lógica en `features/audit/`; `app/admin/auditoria/` solo ruta/layout |
| V. Shared Is Infrastructure | ✔ Pasa | Reutiliza `requireRole` y `authFetch`; sin lógica de dominio en `shared/` |
| Stack (Prisma, Zod, TanStack, Chakra, Vitest) | ✔ Pasa | Sin cambios de stack |
| No new abstractions | ✔ Pasa | Sin interfaces/DI/factories |

**Desviación justificada** (una sola): el plan de entrada propone `eventId FK → Event`, pero no existe tabla `events` en el proyecto (evento único hardcodeado en `messaging.service.ts:6`). Decisión: omitir `eventId` en el MVP. Ver research.md → §eventId.

## Project Structure

### Documentation (this feature)

```text
specs/022-audit-log/
├── plan.md              # Este archivo (/speckit-plan)
├── research.md          # Phase 0 (/speckit-plan)
├── data-model.md        # Phase 1 (/speckit-plan)
├── quickstart.md        # Phase 1 (/speckit-plan)
├── contracts/           # Phase 1 (/speckit-plan)
└── tasks.md             # Phase 2 (/speckit-tasks - NO creado por /speckit-plan)
```

### Source Code (repository root)

```text
backend/
├── prisma/
│   └── schema.prisma                    # + model AuditLog
├── src/
│   ├── app.ts                           # + mount auditRouter en /api/audit-log
│   ├── modules/
│   │   ├── audit/                       # NUEVO módulo
│   │   │   ├── audit.controller.ts
│   │   │   ├── audit.service.ts         # log() + list()
│   │   │   ├── audit.repository.ts
│   │   │   ├── audit.routes.ts
│   │   │   ├── audit.types.ts
│   │   │   └── audit.validators.ts      # zod query params
│   │   ├── tickets/tickets.service.ts   # + audit.log (created/price/status)
│   │   ├── checkin/checkin.service.ts   # + audit.log (checked_in, cancelled)
│   │   └── payments/payments.service.ts # + audit.log (status_changed)
│   └── (discount codes: ubicación a confirmar en tasks)
├── test/
│   └── audit/                           # NUEVO: audit.repository.test.ts, audit.service.test.ts

frontend/
├── app/
│   └── admin/
│       ├── layout.tsx                   # + "/admin/auditoria": ["super_admin"] en ROLE_RESTRICTED_PATHS
│       └── auditoria/page.tsx           # NUEVO (solo ruta, sin lógica)
└── features/
    └── audit/                           # NUEVO feature (convención IV)
        ├── api/audit.endpoints.ts
        ├── api/audit.queries.ts         # useAuditLog (refetchInterval 4000)
        ├── components/AuditLogTable.tsx
        ├── components/AuditLogEmpty.tsx (opcional)
        ├── hooks/useAuditLogPolling.ts  (opcional, si se separa)
        ├── schemas/audit.schema.ts      # zod filters
        └── types/index.ts
└── shared/components/AdminSidebar.tsx   # + enlace "Auditoría" roles: ["super_admin"]
```

**Structure Decision**: Se sigue la estructura vertical existente de `backend/src/modules/<name>/` y la convención frontend `features/<domain>/` + `app/` solo rutas (constitución IV). El módulo es nuevo pero replica el patrón de `donaciones`/`tickets` (controller/service/repository/routes/types/validators). Los archivos del plan de entrada (`useAuditLog.ts`, `AuditLogTable.tsx`) se ubican dentro de `features/audit/` según convención del proyecto, no en la raíz.

## Complexity Tracking

Sin violaciones de constitución → no aplica.
