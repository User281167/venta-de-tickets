<!--
  Sync Impact Report

  Version change: 0.0.0 (template) → 1.0.0

  Modified principles (all new — template was empty placeholders):
    - [PRINCIPLE_1] placeholder → I. Layered Architecture (Not Formal Hexagonal)
    - [PRINCIPLE_2] placeholder → II. Vertical Module Boundaries
    - [PRINCIPLE_3] placeholder → III. WhatsApp Bot as Separate Service
    - [PRINCIPLE_4] placeholder → IV. Frontend Feature-Based Organization
    - [PRINCIPLE_5] placeholder → V. Shared Code Is Infrastructure, Not Domain

  Added sections:
    - Technology Stack & Design Conventions (locked tech decisions + DB/auth/privacy conventions)
    - Quality, Process & Project Context (purpose, identity, quality principles, non-goals)
    - Governance with amendment procedure and versioning

  Removed sections: None (template was placeholder-only)

  Templates requiring updates:
    - .specify/templates/plan-template.md (✅ no changes needed)
    - .specify/templates/spec-template.md (✅ no changes needed)
    - .specify/templates/tasks-template.md (✅ no changes needed)

  Follow-up TODOs: None
-->

# University Event Ticketing Platform Constitution

## Core Principles

### I. Layered Architecture (Not Formal Hexagonal)
API uses a simple layered structure per module
(`routes → controller → service → repository`), organized vertically by
business module, not by technical layer globally. No formal ports/adapters or
DDD tactical patterns.

The one rule kept from hexagonal architecture: the service layer MUST never
import Express, Supabase client, or any infrastructure SDK directly.
Infrastructure access is isolated in `*.repository.ts` and `*.*.client.ts`
files.

### II. Vertical Module Boundaries
Each business capability is a self-contained module under
`src/modules/<name>/` with its own routes, controller, service, repository,
types, and validators. Cross-module logic is only allowed through service-layer
function calls, never through direct repository access across modules.

### III. WhatsApp Bot as Separate Service
The bot is conversational and reactive (intent-based: greeting, event-info,
ticket-status, support-request, fallback), driven by keyword/button detection.
It communicates with the main API exclusively via `/internal/*` endpoints.
It does NOT share a code package with the API's `messaging` module; the
`messaging` module is for outbound/transactional/broadcast communication, the
bot is for inbound 1:1 conversation. Limited duplication of Infobip client
logic between the two is accepted at this scale.

### IV. Frontend Feature-Based Organization
All business logic lives under `src/features/<domain>/`. The Next.js `app/`
directory contains only routes and layouts — no business logic, no data
fetching logic, no validation schemas. Each feature folder may contain
`components/`, `hooks/`, `api/` (TanStack Query hooks + raw fetch calls),
`schemas/` (Zod), and `types/`, with internal structure left flexible.

### V. Shared Code Is Infrastructure, Not Domain
`shared/` (backend and frontend) only holds cross-cutting, domain-agnostic
code: middlewares, error classes, database/client setup, generic utils, generic
UI wrappers. Domain logic MUST never live in `shared/`.

## Technology Stack & Design Conventions

### Technology Stack (Locked Decisions)

| Concern | Choice |
|---|---|
| Backend framework | Express + TypeScript |
| Frontend framework | Next.js (App Router) + TypeScript |
| UI library | Chakra UI |
| Server state | TanStack Query |
| Validation (both ends) | Zod |
| Database / Auth / Storage | Supabase (PostgreSQL) |
| ORM | Prisma |
| Payments | Wompi |
| Communications | Infobip (Email, WhatsApp, SMS) |
| Backend hosting | Railway |
| Rate limiting store | Upstash Redis (only Redis usage in the system) |
| Ticket/PDF generation | PDFKit + `qrcode` |
| Unit/integration testing | Vitest |
| E2E testing | Playwright |

These decisions are considered closed. Changing any requires an explicit
amendment to this constitution, not a silent deviation in a feature spec.

### Design Conventions

- **Data access**: all business-table queries go through Prisma Client inside
  `*.repository.ts` files. Supabase client is used directly only for Auth and
  Storage — never to query business tables alongside Prisma.
- **Database**: UUID primary keys, `snake_case` naming, `TIMESTAMPTZ` for all
  timestamps.
- **Auth**: separate tables for `users` (buyers) and `admins` (organizers/staff)
  — no shared identity table.
- **Privacy compliance (Ley 1581 de 2012)**: enforced via a dedicated
  `privacy_acceptances` table (policy version, timestamp, IP, user agent), not
  as a boolean flag on `users`.
- **Notifications/messages**: transient — not persisted in the database.
- **Pricing flexibility**: modeled as a child table (`ticket_types`) of
  `events`, never as columns on `events`.

## Quality, Process & Project Context

### Purpose
Permanent event ticketing platform for a university context. Supports multiple
concurrent and sequential events over time at medium volume (~thousands of
tickets/users per event cycle). Colombia market — all decisions account for
local cost constraints and Ley 1581 de 2012 (Protección de Datos Personales).

### Quality & Process Principles

- **Simplicity over pattern purity**: prefer the simplest structure that keeps
  the domain decoupled from infrastructure. Do not introduce abstractions
  (interfaces, factories, DI containers) unless a concrete current need
  justifies them.
- **Comments**: only where intent isn't obvious from code (business rules,
  non-obvious trade-offs). No restating-the-obvious comments.
- **Documentation**: lives in `docs/`. Only for architectural decisions,
  critical business rules, and simple process/structure diagrams (Mermaid
  preferred). No documentation for self-evident code.
- **Testing**: Vitest for service/repository unit and integration tests;
  Playwright for critical user E2E flows (purchase, check-in). Tests required
  for business-critical logic (payments, inventory concurrency, ticket
  validation), optional for trivial CRUD.
- **Incremental design**: features are specced layer by layer (schema → API →
  UI) rather than fully detailed end-to-end up front.

### Explicit Non-Goals

- No microservices split beyond the three defined units (backend, frontend,
  whatsapp-bot).
- No NLP/ML in the WhatsApp bot at current volume.
- No DDD aggregates, value objects, or domain events infrastructure.
- No additional caching layer beyond Upstash Redis for rate limiting, unless a
  specific performance need is identified and specced separately.

## Governance

This constitution supersedes all other ad-hoc development practices. All PRs,
specs, plans, and implementation reviews MUST verify compliance with the
principles herein.

Any change to the Core Principles, Technology Stack, or Design Conventions
sections requires:

1. An explicit written rationale (cost, scale, or technical constraint).
2. Update of this file in the same change set as the first spec/plan that
   relies on the new decision.

For runtime development guidance refer to `AGENTS.md`.

**Version**: 1.0.0 | **Ratified**: 2026-07-08 | **Last Amended**: 2026-07-08
