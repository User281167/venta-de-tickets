# Implementation Plan: Donaciones

**Branch**: `019-donaciones` | **Date**: 2026-07-28 | **Spec**: [specs/019-donaciones/spec.md](./spec.md)

**Input**: Feature specification from `/specs/019-donaciones/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implementar sistema de donaciones con Mercado Pago para dos cuentas independientes (La Convención y Barranqueros UTP). Usuarios pueden donar sin cuenta, con formulario simple (nombre opcional, email opcional, monto mínimo 2000 COP). Backend crea preference en MP, maneja webhooks por cuenta, y provee endpoint de status para polling en página de retorno. Cumple con Ley 1581 (no logging de payloads fuera de metadata).

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: Express, Next.js (App Router), Prisma, MercadoPago SDK, Zod, TanStack Query, Chakra UI v3

**Storage**: Supabase PostgreSQL (via Prisma ORM)

**Testing**: Vitest (unit/integration), Playwright (E2E)

**Target Platform**: Web (backend: Railway, frontend: Vercel/Next.js)

**Project Type**: Web application (monorepo: backend + frontend)

**Performance Goals**: Handle 100+ concurrent donation requests, webhook processing < 500ms

**Constraints**: Ley 1581 compliance (no logging PII outside metadata), idempotent webhook handling

**Scale/Scope**: Medium volume (~thousands per event cycle), 2 Mercado Pago accounts, 4 new endpoints, 3 frontend components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Layered Architecture | Module uses routes → controller → service → repository | ✅ PASS |
| II. Vertical Module Boundaries | New module under `src/modules/donaciones/` | ✅ PASS |
| III. WhatsApp Bot as Separate Service | Not applicable (no bot interaction) | ✅ N/A |
| IV. Frontend Feature-Based | Donation logic under `src/features/donaciones/` | ✅ PASS |
| V. Shared Code Is Infrastructure | No domain logic in shared/ | ✅ PASS |
| Tech Stack Locked | Uses Express, Next.js, Prisma, Mercado Pago | ✅ PASS |
| DB Conventions | UUID PKs, snake_case, TIMESTAMPTZ | ✅ PASS |
| No Notifications Persisted | Donations are persisted, but not notifications | ✅ PASS |

**GATE RESULT**: ✅ ALL PASS - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/019-donaciones/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # API contracts
└── tasks.md             # Phase 2 output (future)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── modules/
│   │   └── donaciones/
│   │       ├── donaciones.routes.ts
│   │       ├── donaciones.controller.ts
│   │       ├── donaciones.service.ts
│   │       ├── donaciones.repository.ts
│   │       └── donaciones.schema.ts
│   ├── lib/
│   │   └── payment/
│   │       ├── mercadopago.client.ts
│   │       └── payment-provider.registry.ts
│   └── prisma/
│       └── schema.prisma
└── tests/
    ├── integration/
    │   └── donaciones.test.ts
    └── unit/
        └── donaciones.test.ts

frontend/
├── src/
│   ├── features/
│   │   └── donaciones/
│   │       ├── components/
│   │       │   ├── DonationButton.tsx
│   │       │   └── DonationForm.tsx
│   │       ├── api/
│   │       │   └── donaciones.ts
│   │       ├── schemas/
│   │       │   └── donaciones.ts
│   │       └── types/
│   │           └── donaciones.ts
│   └── app/
│       └── donaciones/
│           └── retorno/
│               └── page.tsx
└── tests/
    └── e2e/
        └── donaciones.spec.ts
```

**Structure Decision**: Monorepo with backend/ and frontend/ separation. Backend follows vertical module pattern under `src/modules/donaciones/`. Frontend follows feature-based organization under `src/features/donaciones/`. Reuses existing PaymentProvider registry pattern.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. No complexity justifications needed.
