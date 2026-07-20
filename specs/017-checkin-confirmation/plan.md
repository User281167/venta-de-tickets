# Implementation Plan: Check-in and Remote Confirmation

**Branch**: `017-checkin-confirmation` | **Date**: 2026-07-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/017-checkin-confirmation/spec.md`

## Summary

Two backend modules for event entry flow: `checkin` (QR scan, direct entry, confirmation requests — for authenticated staff) and `confirmations` (buyer confirm/reject via single-use link — no session). Modular boundaries follow project conventions: separate controllers, services, repositories per module; idempotent state transitions via `WHERE status = X` pattern; two distinct JWT secrets to prevent QR-to-confirmation-link escalation.

## Technical Context

**Language/Version**: TypeScript 5.x (project standard)

**Primary Dependencies**: Express (routing), Zod (validation), Prisma (ticket queries), `jsonwebtoken` (QR + confirmation JWT), `qrcode` (already in project for QR encode/decode)

**Storage**: PostgreSQL via Prisma (tickets table with status transitions)

**Testing**: Vitest (unit: service/repository logic; integration: endpoint behavior with real DB)

**Target Platform**: Node.js backend on Railway

**Project Type**: Backend API module pair (internal endpoints)

**Performance Goals**: Scan returns in <2s; state transition endpoints complete in <500ms; handle race conditions from concurrent checkers

**Constraints**: No additional infrastructure (no new tables, no new queues, no Redis beyond rate limiting); each state transition must be idempotent; `scan` is lock-free read-only

**Scale/Scope**: Single event; multiple concurrent checkers; buyer confirmation via email/WhatsApp link

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Layered Architecture | ✅ PASS | Both modules follow `routes → controller → service → repository`; service never imports Express or Prisma directly |
| II. Vertical Module Boundaries | ✅ PASS | `checkin` and `confirmations` are separate modules; cross-module call only at repository level (`confirmations` uses `checkin.repository`) |
| III. WhatsApp Bot | ✅ N/A | Not involved |
| IV. Frontend Feature Org | ✅ N/A | Backend-only spec |
| V. Shared Is Infrastructure | ✅ PASS | No domain logic in shared/ |
| Tech Stack | ✅ PASS | All chosen technologies are project-standard |
| Design Conventions | ✅ PASS | Prisma for queries, `snake_case`, UUID PKs, no new tables needed |
| Simplicity > Patterns | ✅ PASS | No new abstractions beyond what's needed; messaging interface is a thin function contract |

**Violations**: None.

## Project Structure

### Documentation (this feature)

```text
specs/017-checkin-confirmation/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 — resolved unknowns
├── data-model.md        # Phase 1 — entity definitions & transitions
├── quickstart.md        # Phase 1 — implementation quick reference
├── contracts/           # Phase 1 — API contracts
│   ├── checkin.openapi.yaml
│   └── confirmations.openapi.yaml
└── tasks.md             # Created by /speckit-tasks
```

### Source Code (repository root)

```text
src/modules/checkin/
├── checkin.routes.ts
├── checkin.controller.ts
├── checkin.service.ts
├── checkin.repository.ts
├── checkin.validators.ts
├── checkin.types.ts
└── messaging.client.ts          # Light interface for messaging (module doesn't exist yet)

src/modules/confirmations/
├── confirmations.routes.ts
├── confirmations.controller.ts
├── confirmations.service.ts
├── confirmations.middleware.ts   # Verifies CONFIRMATION_JWT_SECRET
├── confirmations.validators.ts
└── confirmations.types.ts
```

## Complexity Tracking

No constitution violations. Empty section.

## Phase 0 — Research

Research items resolved in [research.md](research.md):

1. Messaging module interface — module doesn't exist; define minimal client interface in checkin
2. Existing code to remove — prior `checkin` implementation (single `POST /internal/checkin`)
3. Confirmation link construction — URL format and token embedding
4. Race condition handling pattern — verify `FOR UPDATE` + `WHERE status = X` + affected-rows check

## Phase 1 — Design

Design artifacts:

- [data-model.md](data-model.md) — ticket states, transitions, check-in record shape
- [contracts/](contracts/) — OpenAPI specs for all endpoints
- [quickstart.md](quickstart.md) — step-by-step implementation guide

Agent context updated in `AGENTS.md` — `<!-- SPECKIT START -->` markers updated.
