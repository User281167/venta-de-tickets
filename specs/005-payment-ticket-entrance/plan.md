# Implementation Plan: Payment Multi-Provider Architecture & Ticket QR Entrance

**Branch**: `011-payment-ticket-entrance` | **Date**: 2026-07-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-payment-ticket-entrance/spec.md`

## Summary

Build payment purchase flow with multi-provider architecture (Mercado Pago first), ticket creation with JWT-signed QR on successful payment, and atomic QR check-in endpoint. Reuse existing `PaymentProvider` interface, fix `eventId` bug in repository, add missing service/controller/routes. No DB schema changes needed — existing Payment/Ticket models suffice.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js (Express)

**Primary Dependencies**: `mercadopago` SDK (existing), `jsonwebtoken` for QR JWT, `qrcode` for PNG generation (existing in constitution), `zod` for validation (existing)

**Storage**: PostgreSQL via Prisma (existing — no new migrations)

**Testing**: Vitest (existing), supertest for integration tests

**Target Platform**: Railway (backend), web browser (frontend)

**Project Type**: Web application (Express API + Next.js frontend)

**Performance Goals**: QR check-in under 1s (JWT verify + DB atomic update). Payment webhook processing under 2s.

**Constraints**: No `process.env` in module code — use `env.ts` (already done). No `process` import or `.env` file reads. No auto-migrations.

**Scale/Scope**: Thousands of tickets per event cycle. One active payment provider at a time (Mercado Pago). ~10 concurrent check-in scanners.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1 — Payments tech stack mismatch
- **Issue**: Constitution line 83 says `Payments: Wompi`, but existing codebase already uses Mercado Pago (`mercadopago` npm package, env vars `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`)
- **Verdict**: **VIOLATION — requires constitution amendment**
- **Justification**: Mercado Pago has stronger market presence in Colombia (Ley 1581-compliant local entity, preferred by university demographic). The codebase was implemented targeting Mercado Pago before constitution was ratified. Amendment to constitution is required before this plan proceeds.

### Gate 2 — Provider interface pattern (Simplicity over pattern purity)
- **Issue**: Creating `PaymentProvider` interface with provider registry adds abstraction level
- **Verdict**: **PASS** — Concrete current need justifies abstraction (FR-003: add providers without modifying core code). Multiple providers planned (PayPal, Stripe as examples). Not premature — first provider (Mercado Pago) already exists.

### Gate 3 — Vertical module boundaries
- **Issue**: Payments module will call tickets service to create tickets on payment success
- **Verdict**: **PASS** — Cross-module calls happen at service layer, per constitution rule II. No direct repository access across modules.

### Gate 4 — Implementation env access
- **Issue**: Module code must not import `process` or read `.env`
- **Verdict**: **PASS** — Existing code uses `env` import from `shared/config/env.ts`. Will continue pattern.

## Project Structure

### Documentation (this feature)

```text
specs/005-payment-ticket-entrance/
├── plan.md              # This file
├── research.md          # Phase 0 — architecture decisions
├── data-model.md        # Phase 1 — entity definitions
├── quickstart.md        # Phase 1 — implementation steps
├── contracts/           # Phase 1 — API endpoint contracts
│   └── api.md
└── tasks.md             # Phase 2 — task breakdown
```

### Source Code (repository root)

```text
backend/src/modules/payments/
├── index.ts                     # Module exports + route registration
├── payments.types.ts            # PaymentProvider interface, shared types (EXISTING)
├── payments.repository.ts       # DB access (EXISTING — fix eventId bug)
├── payments.validators.ts       # Zod schemas (NEW)
├── payments.service.ts          # Business logic — checkout, webhook, check-in (NEW)
├── payments.controller.ts       # Express handlers (NEW)
├── payments.routes.ts           # Express routes (NEW)
├── README.md                    # Module docs (NEW)
└── providers/
    ├── provider.registry.ts     # Provider map + registration (EXISTING)
    └── mercadopago.provider.ts  # Mercado Pago implementation (EXISTING — verify)

backend/src/modules/tickets/
└── tickets.service.ts           # ADD: createTicketForPurchase() method

backend/src/app.ts               # REGISTER: payments routes, webhook route

backend/tests/
├── payments.service.test.ts     # (NEW)
└── check-in.test.ts             # (NEW)
```

**Structure Decision**: Follows existing module pattern (flat files per layer). Payments module mirrors tickets module structure. Providers live in subfolder as specified by user.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Constitution line 83: Wompi → Mercado Pago | Existing codebase already implemented with Mercado Pago before constitution was ratified. Mercado Pago is preferred in Colombia market. | Wompi has smaller market share, less documentation, and codebase already targets Mercado Pago. Rewriting would be wasted effort. |
