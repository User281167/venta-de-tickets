<!-- SPECKIT START -->
Current feature: specs/006-api-dto-refactor/
- spec.md        — feature spec
- plan.md        — implementation plan (tech context, structure, phases)
- research.md    — architecture decisions & schema audit
- data-model.md  — entity, states, validation rules
- contracts/api.md — endpoint contracts
- quickstart.md  — implementation steps
<!-- SPECKIT END -->

# AGENT.md

Guidance for AI coding agents working in this repository.

## Project
Event ticketing platform. Monorepo: `backend/` (API), `frontend/`
(Next.js), `whatsapp-bot/` (standalone service). Colombian market — privacy
compliance (Ley 1581) matters.

Full architectural rules live in `constitution.md` — read it before generating
specs, plans, or code. This file is just the quick reference.

## Stack
- Backend: Express + TypeScript
- Frontend: Next.js (App Router) + TypeScript + Chakra UI + TanStack Query
- Validation: Zod (both ends)
- DB/Auth/Storage: Supabase + Prisma ORM
- Payments: Mercado Pago | Messaging: Infobip | Hosting: Railway
- Rate limit store: Upstash Redis (only Redis usage in the system)
- PDFs/QR: PDFKit + `qrcode`
- Tests: Vitest (unit/integration) + Playwright (E2E)

## Architecture rules
- Layered, not strict hexagonal: `routes → controller → service → repository`,
  organized per module under `src/modules/<name>/`.
- `service` layer never imports Express or Supabase directly — only through
  `repository` / `*.client.ts` files.
- No cross-module repository access; only call other modules' services.
- `whatsapp-bot` is a separate service, talks to the API only via
  `/internal/*` endpoints. Not a shared package with `messaging`.
- Frontend: business logic lives in `src/features/<domain>/`. `app/` is
  routes/layouts only — no fetching, no validation logic there.
- `shared/` (either side) is infrastructure/cross-cutting only — never domain
  logic.

## Conventions
- DB: UUID PKs, `snake_case`, `TIMESTAMPTZ` for timestamps.
- Separate `users` and `admins` tables — no shared identity table.
- Notifications are not persisted.
- Don't introduce new abstractions (DI, factories, interfaces) unless there's
  a concrete current need.

## Working style
- Work incrementally: schema → API → UI, one layer at a time.
- Comments only where intent isn't obvious (business rules, trade-offs).
- Docs go in `docs/`: architecture decisions, critical rules, simple Mermaid
  diagrams only — no documenting the obvious.
- Conversation/spec language: Spanish. Code, identifiers, and comments:
  English.

## Before changing stack or architecture
Don't silently deviate. Any change to stack choices or layering rules requires
updating `constitution.md` first, with a stated reason (cost, scale, or
technical constraint).
