# Implementation Plan: Admin Payments Manager

**Branch**: `dev` | **Date**: 2026-07-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/013-admin-payments-manager/spec.md`

## Summary

Admin interface to view, filter, detail, and refund ticket payments. Backend already has `listAllPayments` + `getPaymentDetail` endpoints. Need to add: filtering/sorting on list endpoint, Refund model + integration, and full frontend UI under `/admin/pagos`.

## Technical Context

**Language/Version**: TypeScript 5.x (both ends)

**Primary Dependencies**: Express (backend), Next.js 15 + Chakra UI v3 + TanStack Query v5 (frontend), Prisma ORM, Mercado Pago SDK, Zod

**Storage**: PostgreSQL via Supabase, managed by Prisma ORM. `payments` table exists. Refund records need new `refunds` table.

**Testing**: Vitest (both ends) — `@testing-library/react` + `userEvent` for component tests, `vi.mock` for hook mocking

**Target Platform**: Web (admin dashboard)

**Project Type**: Monorepo — backend (Express API) + frontend (Next.js App Router)

**Performance Goals**: Payment list loads in <2s for 10k records (pagination: 25/page). Refund completes in <5s (includes gateway call).

**Constraints**: Only super_admin and admin roles can access. Payment gateway integration required for refunds. All user-facing text in Spanish.

**Scale/Scope**: ~10k payment records, ~100 concurrent admin users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No constitution.md found. No gates defined. Proceed.

## Project Structure

### Documentation (this feature)

```text
specs/013-admin-payments-manager/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
# Monorepo: Web application (frontend + backend)

backend/
├── prisma/
│   └── schema.prisma          # Add Refund model, partially_refunded PaymentStatus
└── src/modules/
    ├── admins/
    │   ├── admins.controller.ts   # Add refundPaymentHandler
    │   ├── admins.routes.ts       # POST /payments/:id/refund, enhance GET /payments with filters
    │   ├── admins.validators.ts   # Add refundSchema, paymentFiltersSchema
    │   ├── admins.service.ts      # Add processRefund method
    │   └── admins.repository.ts   # Add refund queries
    └── payments/
        ├── payments.service.ts    # Enhance listAllPayments with filters, add processRefund
        └── payments.repository.ts # Add findRefundsByPaymentId, createRefund

frontend/
├── features/
│   └── admin-payments/
│       ├── api/
│       │   └── admin-payments.queries.ts    # TanStack Query hooks
│       ├── components/
│       │   ├── __tests__/
│       │   │   ├── PaymentsList.test.tsx
│       │   │   ├── PaymentDetail.test.tsx
│       │   │   ├── RefundDialog.test.tsx
│       │   │   └── PaymentsExport.test.tsx
│       │   ├── PaymentsList.tsx             # Table + filters
│       │   ├── PaymentsTable.tsx            # Table rows
│       │   ├── PaymentsTableSkeleton.tsx    # Loading state
│       │   ├── PaymentFilters.tsx           # Status/date/search filters
│       │   ├── PaymentDetail.tsx            # Full payment detail view
│       │   ├── RefundDialog.tsx             # Refund form dialog
│       │   └── PaymentsExport.tsx           # CSV export button
│       ├── hooks/
│       │   └── usePaymentExport.ts          # CSV generation logic
│       └── schemas/
│           ├── __tests__/
│           │   └── admin-payments.schema.test.ts
│           └── admin-payments.schema.ts     # Filter/refund Zod schemas
├── app/admin/
│   └── pagos/
│       ├── page.tsx                # Payment list route (→ PaymentsList)
│       └── [id]/
│           └── page.tsx            # Payment detail route (→ PaymentDetail)
└── shared/
    ├── components/
    │   └── AdminSidebar.tsx        # Add "Pagos" nav link
    └── api/
        ├── admin-fetch.ts          # Reuse authFetch
        └── api-error.ts            # Reuse ApiError
```

**Structure Decision**: Follow existing monorepo layout. New `features/admin-payments/` module — same pattern as `admin-users` and `admin-tickets`. Route under `app/admin/pagos/`. Backend routes already exist at `/api/admin/payments` — enhance existing handlers.

## Complexity Tracking

No constitution violations. No complexity justification needed.
