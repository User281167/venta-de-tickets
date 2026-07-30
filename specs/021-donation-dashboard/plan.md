# Implementation Plan: Admin Donation Dashboard

**Branch**: `021-donation-dashboard` | **Date**: 2026-07-30 | **Spec**: [specs/021-donation-dashboard/spec.md](./spec.md)

**Input**: Feature specification from `specs/021-donation-dashboard/spec.md`

## Summary

Add admin donation dashboard extending existing donation module. Backend adds paginated list endpoint with filters + email resend, plus cron job expiring pending donations every 20 min. Frontend adds `/admin/donaciones` page with table, filters, and resend button. Extends messaging module with donation-confirmed email template + notification orchestrator.

## Technical Context

**Language/Version**: TypeScript 5.x (backend), TypeScript 5.x (frontend/Next.js)

**Primary Dependencies**: Express, Prisma, Resend, TanStack Query, Chakra UI v3, Zod

**Storage**: Supabase PostgreSQL (via Prisma ORM) — no new tables or migrations

**Testing**: Vitest (unit/integration — repository, service, notification logic)

**Target Platform**: Web (backend: Railway, frontend: Vercel/Next.js)

**Project Type**: Web application (monorepo: backend + frontend)

**Performance Goals**: Dashboard load < 2s for 1000 donations, filters < 500ms, email resend < 3s

**Constraints**: Donation state transitions must be idempotent; email send is fire-and-forget; adminMiddleware must include super_admin

**Scale/Scope**: Medium (~donations per event cycle), ~7 new backend files, ~5 frontend files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Layered Architecture | Routes in admins module; donation repo methods in donaciones module; email in messaging module | ✅ PASS |
| II. Vertical Module Boundaries | Admin donations stay in donaciones/ repository + service; admin routes in admins/ | ✅ PASS |
| III. WhatsApp Bot as Separate Service | Not applicable | ✅ N/A |
| IV. Frontend Feature-Based | `features/admin-donations/` for code; `app/admin/donaciones/` for page | ✅ PASS |
| V. Shared Code Is Infrastructure | Only adminMiddleware role list change in shared/ | ✅ PASS |
| Tech Stack Locked | Express, Prisma, Resend, Chakra, TanStack Query — all existing | ✅ PASS |
| DB Conventions | No new tables; uses existing Donation schema | ✅ PASS |
| No Notifications Persisted | Emails are fire-and-forget, not persisted | ✅ PASS |

**GATE RESULT**: ✅ ALL PASS — Proceed to implementation

**Post-Design Re-check**: ✅ Still PASS — no new principles violated

## Project Structure

### Documentation (this feature)

```text
specs/021-donation-dashboard/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 setup guide
├── contracts/
│   └── api.md           # API contracts
└── tasks.md             # Phase 2 output (future)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── modules/
│   │   ├── donaciones/
│   │   │   ├── donaciones.repository.ts       # MODIFY: add findAllAdmin, expirePending
│   │   │   ├── donaciones.service.ts          # MODIFY: add listDonations, resendEmail
│   │   │   ├── donaciones.controller.ts       # MODIFY: add listDonations, resendEmail handlers
│   │   │   ├── donaciones.schema.ts           # MODIFY: add admin-list query Zod schemas
│   │   │   └── donaciones.routes.ts           # UNCHANGED (public routes)
│   │   ├── admins/
│   │   │   ├── admins.routes.ts               # MODIFY: add admin donations routes
│   │   │   └── admins.controller.ts           # MODIFY: add donation handlers
│   │   └── messaging/
│   │       ├── messaging.service.ts           # MODIFY: add sendDonationConfirmation
│   │       ├── templates/
│   │       │   └── donation-confirmed.html    # NEW: email template
│   │       ├── notifications/
│   │       │   ├── payment-notifications.ts   # UNCHANGED
│   │       │   └── donation-notifications.ts  # NEW: notifyDonationConfirmed orchestration
│   │       └── index.ts                       # MODIFY: export new notification
│   └── shared/
│       ├── jobs.ts                            # MODIFY: add donation expiry job
│       ├── config/
│       │   └── constants.ts                   # MODIFY: add DONATION_EXPIRY_INTERVAL
│       └── middlewares/
│           └── admin.middleware.ts            # MODIFY: add 'super_admin' to ADMIN_ROLES

frontend/
├── app/admin/donaciones/
│   └── page.tsx                               # NEW: page, imports DonationsList
└── features/admin-donations/
    ├── api/
    │   └── admin-donations.queries.ts         # NEW: TanStack Query hooks
    ├── components/
    │   ├── DonationsList.tsx                  # NEW: main list with filters, pagination
    │   ├── DonationsTable.tsx                 # NEW: table + resend button per row
    │   ├── DonationsFilters.tsx               # NEW: state/account filters + search
    │   ├── DonationsTableSkeleton.tsx         # NEW: loading skeleton
    │   └── DonationsEmpty.tsx                 # NEW: empty state
    └── types/
        └── index.ts                           # NEW: TypeScript types
```

**Structure Decision**: Monorepo with `backend/` and `frontend/` separation. Admin donation logic is split across modules: CRUD in `donaciones/`, routes in `admins/`, email in `messaging/`. Frontend feature code in `features/admin-donations/`.

## Complexity Tracking

No constitution violations. No complexity justifications needed.
