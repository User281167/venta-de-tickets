# Implementation Plan: Payment System

**Branch**: `009-payment-system` | **Date**: 2026-07-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/009-payment-system/spec.md`

## Summary

Provider-agnostic payment checkout with Mercado Pago Checkout Pro initial implementation. Checkout atomically reserves tickets + creates payment record, then calls provider. Webhook processing verifies signature, idempotently updates payment/ticket state. Provider interface enables zero-core-code-swaps.

## Technical Context

**Language/Version**: TypeScript (strict mode, Node 20+)

**Primary Dependencies**: `mercadopago` (npm SDK v2), Express (existing), Prisma (existing), Zod (existing), `jose` (existing, for JWT)

**Storage**: PostgreSQL via Prisma ORM (existing). `payments` table redesign — existing model uses singular `ticketId` (unique), spec needs one-to-many from `payment` → `tickets`. New `Payment` model: `userId`, `eventId`, `provider`, `providerTxId?`, `amountCents` (Int), `status` (enum: pending/completed/failed), `metadata` (Json?), timestamps.

**Testing**: Vitest (existing backend convention). Unit: service orchestration mocked at repository/provider boundary. Integration: DB transaction tests with test container. No E2E for MP — use sandbox webhook simulation.

**Target Platform**: Linux server (Railway deployment, existing)

**Project Type**: Web service (Express backend) + Next.js frontend

**Performance Goals**: Checkout completes <2s server-side (transaction + provider call). Webhook processing <500ms.

**Constraints**: <500ms p95 webhook processing (idempotency check + DB write). DB transaction must complete <200ms.

**Scale/Scope**: Expected 1k–5k concurrent checkouts per event launch.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: PASS (soft gate)

Constitution at `.specify/memory/constitution.md` is an unpopulated template — no concrete architectural rules, constraints, or governance to evaluate against. Feature follows established project patterns (modular Express backend, feature-first frontend, Prisma ORM, Zod validation). No violations detected.

*Re-check after Phase 1:* The provider registry pattern is new to this codebase but justified by FR-2/FR-6 (provider-agnostic service, extensibility). No constitution violations.

## Project Structure

### Documentation (this feature)

```text
specs/009-payment-system/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── prisma/
│   └── migrations/XXXX_add_payments/
│       (payments table redesign + PaymentStatus enum update + payment_id on tickets)
│
└── src/
    ├── config/
    │   └── env.ts                      + PAYMENT_PROVIDER, FRONTEND_URL,
    │                                     MERCADOPAGO_ACCESS_TOKEN,
    │                                     MERCADOPAGO_WEBHOOK_SECRET
    └── modules/payments/
        ├── payments.types.ts            PaymentProvider interface + shared types
        ├── payments.repository.ts       create, updateStatus, findByReference
        ├── payments.service.ts          checkout orchestration (no SDK imports)
        ├── payments.webhook.ts          verify -> parse -> delegate to service
        ├── payments.controller.ts       request/response handling
        ├── payments.routes.ts           POST /checkout (auth), POST /webhook (public)
        └── providers/
            ├── provider.registry.ts     getProvider(name): PaymentProvider
            └── mercadopago.provider.ts  implements PaymentProvider

frontend/
└── src/features/payments/
    ├── components/
    │   └── CheckoutButton.tsx          triggers checkout, redirects to MP
    ├── api/
    │   ├── payments.endpoints.ts
    │   └── payments.queries.ts         useCheckout mutation
    └── schemas/
        └── payments.schema.ts          Zod: checkoutSchema
```

**Structure Decision**: Single backend project with modular `modules/payments/` package (established pattern). New provider registry under `providers/` subfolder — this is the only novel structural addition, justified by FR-2/FR-6.

## Build Order

Sequential phases, each producing testable output:

| Step | What | Depends On | Artifact |
|------|------|-----------|----------|
| **P0** | Research MP SDK, webhook signature, existing cron for ticket expiry | — | research.md |
| **P1a** | Prisma migration: new Payment model, payment_id on Ticket | P0 | migration file |
| **P1b** | Payment types + PaymentProvider interface + registry | P0 | types, registry |
| **P1c** | MercadoPago provider implementation | P1b, P0 | mercadopago.provider.ts |
| **P1d** | Payments repository | P1a | repository |
| **P1e** | Payments service (checkout orchestration) | P1b, P1d | service |
| **P1f** | Payments controller + routes (checkout + webhook) | P1e, P1c | controller, routes |
| **P1g** | Webhook handler (verify → parse → idempotent update) | P1e, P1c | webhook |
| **P1h** | Wire routes in app.ts + env vars | P1f, P1g | app.ts, env.ts |
| **P1i** | Frontend: CheckoutButton + API hooks | P1f | frontend feature |
| **P2** | Generate tasks from this plan | P1 | tasks.md |

**Dependency graph**:
```
P1a ─┐
P1b ─┼──> P1d ──> P1e ──> P1f ──> P1h ──> P1i
P1c ─┘         └──> P1g ──┘
```

## Complexity Tracking

No complexity violations. Provider registry pattern is new but justified by explicit FR-2 (no SDK in service) and FR-6 (zero-code-change provider swaps). No alternatives rejected — this is the simplest approach that satisfies both requirements.
