# Implementation Plan: Prisma Schema & Database Setup

**Branch**: `001-prisma-schema-setup` | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-prisma-schema-setup/spec.md`

## Summary

Define complete Prisma schema (`schema.prisma`) covering 12 business entities (users, admins, privacy_acceptances, venues, events, event_images, ticket_types, discount_codes, tickets, payments, event_guests, survey_responses) with Prisma enums for status fields and UUID PKs. Set up Prisma Client singleton connected to Supabase PostgreSQL (pooled DATABASE_URL for queries, DIRECT_URL for migrations). Entities built incrementally following FK dependency order.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: Prisma ORM (`prisma`, `@prisma/client`)

**Storage**: Supabase PostgreSQL (pgBouncer pooled connection for runtime, direct connection for migrations)

**Testing**: `prisma validate` for schema correctness; manual migration test

**Target Platform**: Railway (Node.js runtime)

**Project Type**: Web service backend (Express + TypeScript monorepo)

**Performance Goals**: Schema validation completes in <5s; migration completes in <30s

**Constraints**: Supabase free tier (500MB DB, 2 connections); pgBouncer incompatibility with some Prisma migrate operations if DIRECT_URL misconfigured

**Scale/Scope**: Schema for event ticketing platform serving Colombian market; initial entity set includes 12 models

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: Constitution template not yet ratified — no active gates. Proceeding directly to Phase 0.

All design decisions documented below uphold the architectural rules in AGENTS.md (layered architecture, no cross-module repo access, shared/ for infra only).

## Project Structure

### Documentation (this feature)

```text
specs/001-prisma-schema-setup/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (empty — no external interfaces in scope)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   └── shared/
│       └── database/
│           └── prisma.client.ts
└── .env                  # DATABASE_URL (pooled), DIRECT_URL (direct)
```

**Structure Decision**: Monorepo backend directory with Prisma schema at `backend/prisma/schema.prisma` and client singleton at `backend/src/shared/database/prisma.client.ts` (per project convention — shared/ is infrastructure only).

## Complexity Tracking

No constitution violations to justify.
