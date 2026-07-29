# Implementation Plan: ePayco Checkout Provider

**Branch**: `020-epayco-checkout` | **Date**: 2026-07-29 | **Spec**: [specs/020-epayco-checkout/spec.md](./spec.md)

**Input**: Feature specification from `specs/020-epayco-checkout/spec.md`

## Summary

Add ePayco as a new payment provider following existing multi-provider architecture. Backend implements `PaymentProvider` interface with ePayco Apify API integration (login → create session → webhook processing). Frontend adds ePayco payment option with Smart Checkout onpage widget. No new DB schema — reuses existing payments tables.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: Express, Next.js (App Router), Prisma, ePayco Apify REST API, Zod, TanStack Query, Chakra UI v3

**Storage**: Supabase PostgreSQL (via Prisma ORM) — no new tables

**Testing**: Vitest (unit/integration), Playwright (E2E)

**Target Platform**: Web (backend: Railway, frontend: Vercel/Next.js)

**Project Type**: Web application (monorepo: backend + frontend)

**Performance Goals**: Checkout session creation < 1s, webhook processing < 500ms

**Constraints**: ePayco Bearer token has 20-min TTL — must refresh; webhook idempotency; Ley 1581 compliance (no PII logging)

**Scale/Scope**: Medium volume (~thousands per event cycle), 1 ePayco account, ~4 new backend files, ~3 frontend files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Layered Architecture | Provider under existing payments module; uses routes → controller → service → repository | ✅ PASS |
| II. Vertical Module Boundaries | Stays inside `src/modules/payments/providers/` — no cross-module leaks | ✅ PASS |
| III. WhatsApp Bot as Separate Service | Not applicable | ✅ N/A |
| IV. Frontend Feature-Based | ePayco UI under `src/features/payments/` or `src/features/checkout/` | ✅ PASS |
| V. Shared Code Is Infrastructure | No domain logic in shared/ | ✅ PASS |
| Tech Stack Locked | Express, Next.js, Prisma — ePayco REST API is external dependency | ✅ PASS |
| DB Conventions | No new tables; uses existing `Payment` schema (snake_case, UUID PKs) | ✅ PASS |
| No Notifications Persisted | Notifications not affected | ✅ N/A |

**GATE RESULT**: ✅ ALL PASS - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/020-epayco-checkout/
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
│   │   └── payments/
│   │       ├── providers/
│   │       │   ├── epayco.provider.ts         # NEW: PaymentProvider implementation
│   │       │   ├── provider.registry.ts       # MODIFY: register epayco
│   │       │   └── epayco/
│   │       │       └── apify-auth.service.ts  # NEW: Bearer token lifecycle mgmt
│   │       ├── payments.service.ts            # REUSE: existing webhook handler
│   │       ├── payments.controller.ts         # REUSE or minor route addition
│   │       └── payments.routes.ts             # MODIFY: add /webhook/epayco route
│   ├── shared/
│   │   └── config/
│   │       └── env.ts                         # MODIFY: add ePayco env vars
│   └── prisma/
│       └── schema.prisma                      # UNCHANGED
├── .env.example                               # MODIFY: add ePayco env vars
└── tests/
    ├── unit/
    │   └── providers/
    │       └── epayco.test.ts                 # NEW
    └── integration/
        └── payments.test.ts                   # MODIFY: add ePayco scenarios

frontend/
├── src/
│   ├── features/
│   │   ├── payments/
│   │   │   ├── api/
│   │   │   │   └── epayco.ts                  # NEW: session creation, polling
│   │   │   ├── components/
│   │   │   │   └── EpaycoCheckoutButton.tsx   # NEW: init Smart Checkout widget
│   │   │   └── types/
│   │   │       └── epayco.ts                  # NEW: TypeScript types
│   │   └── checkout/
│   │       └── components/                    # MODIFY: add ePayco as provider option
├── public/
│   └── epayco-v2.js                           # OPTIONAL: local copy of checkout script
└── tests/
    └── e2e/
        └── epayco-checkout.spec.ts            # NEW
```

**Structure Decision**: Monorepo with backend/ and frontend/ separation. ePayco provider lives inside existing `payments` module — no new module needed. Frontend feature code under existing `features/payments/` and `features/checkout/`.

## Complexity Tracking

No violations. No complexity justifications needed.
