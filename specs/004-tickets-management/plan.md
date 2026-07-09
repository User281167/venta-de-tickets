# Implementation Plan: Tickets Management

**Branch**: `010-create-endpoints-tickets` | **Date**: 2026-07-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-tickets-management/spec.md`

## Summary

Create ticket type CRUD endpoints with role-based access (admin-only mutations, public read). Three states: enabled (purchasable), disabled (visible, not purchasable), blocked (hidden, not purchasable). Validation: price > 0, quantity > 0, quantity cannot drop below sold count. Replaces existing `ticket-types/` module which uses boolean `isActive`. Migrate Prisma schema: `isActive Boolean` → `status TicketStatus` enum.

## Technical Context

**Language/Version**: TypeScript (Node.js 18+)

**Primary Dependencies**: Express, Prisma, Zod, Supabase (auth only)

**Storage**: PostgreSQL (via Supabase + Prisma ORM)

**Testing**: Vitest

**Target Platform**: Linux server (Railway)

**Project Type**: Web API (Express)

**Performance Goals**: List endpoint < 2s for 100 ticket types. CRUD ops < 500ms.

**Constraints**: Existing `ticket_types` table with `isActive` boolean must be migrated. No eventId — spec keeps ticket types event-agnostic.

**Scale/Scope**: Medium (~hundreds ticket types per platform lifecycle)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Gates

- **Principle I (Layered Architecture)**: ✅ Service layer won't import Express/Supabase directly. Repository handles Prisma queries. Pattern matches existing modules.
- **Principle II (Vertical Module Boundaries)**: ✅ New `tickets` module (replacing `ticket-types`) is self-contained. Cross-module calls only via services.
- **Principle III (WhatsApp Bot)**: ✅ Not affected.
- **Principle IV (Frontend)**: ✅ Not affected — backend-only feature.
- **Principle V (Shared Code)**: ✅ Env access via existing `shared/config/env.ts`. Reuses `auth.middleware.ts`, `admin.middleware.ts`, error classes, pagination schema.
- **Technology Stack**: ✅ Express, Prisma, Zod, Supabase Auth all already in stack.
- **Design Conventions**: ✅ UUID PKs, `snake_case` collection names, `TIMESTAMPTZ`. Separate `admins` table for admin auth.
- **Simplicity**: ✅ Flat module files (no subdirectories). Reuses existing patterns — no new abstractions.

**Result**: PASS — no violations. Complexity Tracking not required.

### Post-Design Check

- **Principle I (Layered Architecture)**: ✅ Flat module files with service→repository isolation. Service won't import Express or Supabase directly.
- **Principle II (Vertical Module Boundaries)**: ✅ Self-contained `tickets` module. Only shared dependency: Prisma client via `shared/database/`.
- **Principle III (WhatsApp Bot)**: ✅ Not affected.
- **Principle IV (Frontend)**: ✅ Not affected — backend-only feature.
- **Principle V (Shared Code)**: ✅ Reuses `shared/config/env.ts`, `shared/middlewares/auth.middleware.ts`, `shared/middlewares/admin.middleware.ts`, `shared/errors/`.
- **Technology Stack**: ✅ Express, Prisma, Zod, Supabase Auth — all approved.
- **Design Conventions**: ✅ UUID PKs, `snake_case` collection names, `TIMESTAMPTZ`. Separate `admins` table for admin auth.
- **Simplicity**: ✅ Flat files in module (no subdirectories). No new abstractions.

**Result**: PASS — no violations. Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/004-tickets-management/
├── plan.md              # This file
├── research.md          # Phase 0 output — existing patterns, schema audit
├── data-model.md        # Phase 1 output — entity, states, validation rules
├── quickstart.md        # Phase 1 output — implementation steps
├── contracts/           # Phase 1 output — API contracts (endpoints)
├── checklists/          # Spec quality checklist
│   └── requirements.md
└── spec.md              # Feature specification
```

### Source Code (repository root)

```text
backend/
├── prisma/
│   └── schema.prisma          # + TicketStatus enum, update TicketType model
│   └── migrations/            # + New migration: isActive→status
├── src/
│   ├── modules/
│   │   ├── tickets/           # NEW module (replaces ticket-types/)
│   │   │   ├── index.ts
│   │   │   ├── tickets.routes.ts
│   │   │   ├── tickets.controller.ts
│   │   │   ├── tickets.service.ts
│   │   │   ├── tickets.repository.ts
│   │   │   ├── tickets.validators.ts
│   │   │   ├── tickets.types.ts
│   │   │   └── tickets.config.ts     # Module constants
│   │   └── ... (existing modules unchanged)
│   └── shared/                # Existing (reused)
│       ├── config/
│       ├── middlewares/
│       ├── errors/
│       └── database/
├── tests/
│   ├── unit/
│   │   └── tickets/           # NEW
│   └── integration/
│       └── tickets/           # NEW
└── ... (frontend/ whatsapp-bot/ unchanged)
```

**Structure Decision**: Flat module files in `src/modules/tickets/` — no subdirectories for layers. Follows existing pattern from `admins/`, `users/`, `me/` modules. Old `ticket-types/` module removed entirely.

## Complexity Tracking

> None — no constitution violations requiring justification.
