# Implementation Plan: Ticketing

**Branch**: `008-ticketing` | **Date**: 2026-07-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from spec.md — schema + seed, ticket types admin, public event page, reservation flow

## Summary

Add full ticketing system: schema mods (Event prefix/location/description, TicketType price→cents, Ticket qrToken/ticket_seq), admin CRUD for ticket types, public event page with live availability, atomic reservation (FOR UPDATE + sequence), 10-min TTL with cron expiration, frontend countdown timer. Stack: Express/TS backend + Next.js/Chakra UI frontend + Supabase/Prisma.

## Technical Context

**Language/Version**: TypeScript 5.x, Node 20+

**Primary Dependencies**: Express, Prisma, Zod, jsonwebtoken (QR signing), node-cron (expiration job), @prisma/client

**Storage**: PostgreSQL via Supabase (existing), `ticket_seq` Postgres sequence for ticket codes

**Testing**: Vitest (unit/integration), Playwright (E2E)

**Target Platform**: Linux (Railway), modern browsers

**Project Type**: Web application (backend API + Next.js frontend)

**Performance Goals**: Reservation under 500ms p95, concurrent last-slot race handled correctly

**Constraints**: Must reconcile with existing Event/TicketType/Ticket schema; COP cents pricing; QR_JWT_SECRET separate from Supabase JWT

**Scale/Scope**: Single-event platform, 5 user stories (P1+P2), ~4-week build

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Layered architecture**: Plan follows `routes → controller → service → repository` pattern. PASS
- **No cross-module repository access**: ticket-types and tickets modules call each other's services only. PASS
- **service layer isolation**: Services import only repositories/clients, not Express or Supabase directly. PASS
- **No new abstractions without need**: Using established patterns — no DI, factories, interfaces introduced. PASS
- **Conversation in Spanish, code in English**: Spec is Spanish, code identifiers English. PASS
- **UUID PKs, snake_case, TIMESTAMPTZ**: Existing convention maintained. PASS
- **Constitution file check**: Root `constitution.md` not found — project uses AGENTS.md as guidance. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/008-ticketing/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code

```text
backend/
├── prisma/
│   ├── schema.prisma               # Modify Event, TicketType, Ticket models
│   ├── migrations/
│   │   └── XXXX_ticketing/         # New migration
│   └── seed.ts                     # + event record + initial ticket types
└── src/
    ├── shared/
    │   ├── config/
    │   │   ├── env.ts              # + QR_JWT_SECRET
    │   │   └── constants.ts        # + RESERVATION_TTL_MINUTES=10
    │   └── jobs/
    │       └── expire-reservations.job.ts  # node-cron */2 * * * *
    └── modules/
        ├── ticket-types/
        │   ├── ticket-types.routes.ts
        │   ├── ticket-types.controller.ts
        │   ├── ticket-types.service.ts
        │   ├── ticket-types.repository.ts
        │   ├── ticket-types.types.ts
        │   └── ticket-types.validators.ts
        └── tickets/
            ├── tickets.routes.ts
            ├── tickets.controller.ts
            ├── tickets.service.ts
            ├── tickets.repository.ts
            ├── tickets.qr.ts               # signQrToken, verifyQrToken
            ├── tickets.types.ts
            └── tickets.validators.ts

frontend/
└── src/
    ├── features/
    │   ├── ticket-types/
    │   │   ├── components/
    │   │   │   ├── TicketTypeCard.tsx
    │   │   │   └── TicketTypeForm.tsx
    │   │   ├── api/
    │   │   │   ├── ticket-types.queries.ts
    │   │   │   └── ticket-types.endpoints.ts
    │   │   └── schemas/ticket-types.schema.ts
    │   └── tickets/
    │       ├── components/
    │       │   ├── TicketSelector.tsx
    │       │   ├── ReservationTimer.tsx
    │       │   └── ReservationExpired.tsx
    │       ├── hooks/
    │       │   └── useReservationTimer.ts
    │       ├── api/
    │       │   ├── tickets.queries.ts
    │       │   └── tickets.endpoints.ts
    │       └── schemas/tickets.schema.ts
    └── app/
        ├── (public)/eventos/[eventId]/page.tsx
        └── admin/ticket-types/page.tsx
```

**Structure Decision**: Web application (backend + frontend). Follows existing project conventions — backend modules under `src/modules/`, frontend features under `src/features/`, routes in `app/`. New `src/shared/jobs/` for cron.

## Complexity Tracking

No constitution violations to justify.
