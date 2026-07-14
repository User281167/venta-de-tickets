# Implementation Plan: Admin Manual Payment

**Branch**: `014-admin-manual-payment` | **Date**: 2026-07-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/014-admin-manual-payment/spec.md`

## Summary

Add `created_by` field to payments table. New backend endpoint `POST /admin/payments/manual` creates a payment (provider MANUAL or GIFT) + tickets for a user in a single DB transaction. Stock validated per ticket type. maxPerUser bypassed for admin. Frontend: "Add payment" action button on each user row opens dialog showing ticket types with quantity inputs.

## Technical Context

**Language/Version**: TypeScript 5.x (both ends)

**Primary Dependencies**: Express (backend), Next.js 15 + Chakra UI v3 + TanStack Query v5 (frontend), Prisma ORM, Zod

**Storage**: PostgreSQL via Supabase, managed by Prisma ORM. Add `created_by` nullable column to `payments` table (FK → `admins`).

**Testing**: Vitest — `@testing-library/react` + `userEvent` for component tests, `vi.mock` for hook mocking

**Target Platform**: Web (admin dashboard)

**Project Type**: Monorepo — backend (Express API) + frontend (Next.js App Router)

**Performance Goals**: Admin-only feature, <2s response time for payment creation at <100 concurrent users.

**Constraints**: Only authenticated admins with `admin` role can create manual/gift payments. Provider limited to MANUAL or GIFT. Stock must be validated per ticket type. Admin bypasses maxPerUser. All in DB transaction with rollback.

**Scale/Scope**: ~100 admin users, low-frequency creation. Single payment may create 1-50 tickets across multiple types.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1 — Layer isolation
Service layer must not import Express or Prisma directly.

Status: PASS — existing payments service follows this; new code follows same pattern.

### Gate 2 — Module boundaries
New endpoint in `admins/` module. Payment + ticket creation logic in `payments/` service/repository. Stock validation in `tickets/` repository.

Status: PASS — follows existing pattern (`admins.controller.ts` calls `paymentsService`).

### Gate 3 — No new abstractions
No DI containers, factories, or interfaces needed.

Status: PASS — follows existing simple layered pattern.

### Gate 4 — Frontend feature boundaries
Business logic in `features/`, routes in `app/`.

Status: PASS — dialog in `features/admin-users/components/`, mutation hook in `features/admin-payments/api/`.

## Project Structure

### Documentation (this feature)

```text
specs/014-admin-manual-payment/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── prisma/
│   └── schema.prisma              # Add createdBy to Payment model (FK → admins)
└── src/modules/
    ├── admins/
    │   ├── admins.routes.ts       # Add POST /payments/manual
    │   ├── admins.controller.ts   # Add createAdminPaymentHandler
    │   ├── admins.service.ts      # Add createAdminPayment (validates user, calls paymentsService)
    │   └── admins.validators.ts   # Add createAdminPaymentSchema (userId, provider, tickets[])
    └── payments/
        ├── payments.service.ts    # Add createAdminPayment (validates stock, creates payment+tickets in tx)
        ├── payments.repository.ts # Add createAdminPaymentTransaction (payment + tickets + stock in one raw query tx)
        └── payments.types.ts      # Add AdminPaymentInput, TicketQuantityInput types

frontend/
├── features/
│   ├── admin-users/
│   │   └── components/
│   │       ├── UserTable.tsx              # Add state for payment dialog
│   │       ├── UserTableItem.tsx          # Add "Add Payment" action button
│   │       └── AddPaymentDialog.tsx       # NEW: modal with ticket type quantities + provider select
│   └── admin-payments/
│       ├── api/
│       │   └── admin-payments.queries.ts  # Add useCreateAdminPayment mutation
│       └── schemas/
│           └── admin-payments.schema.ts   # Add CreateAdminPaymentInput type
└── shared/
    └── api/
        └── admin-fetch.ts        # Unchanged (reused)
```

**Structure Decision**: Follow existing monorepo layout. New endpoint in `admins/` module. Payment + ticket creation in `payments/` module (single transaction). Frontend dialog in `admin-users`, mutation hook in `admin-payments`.

## Complexity Tracking

No constitution violations. No complexity justification needed.
