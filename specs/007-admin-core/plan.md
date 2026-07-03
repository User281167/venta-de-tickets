# Implementation Plan: Admin Core

**Branch**: `007-admin-core` | **Date**: 2026-06-30 | **Spec**: specs/007-admin-core/spec.md

**Input**: Feature specification from specs/007-admin-core/spec.md

## Summary

Establish admin authentication (email/password), protected shell with role-aware sidebar, and two data views: paginated user list with search and onboarding survey responses. Three admin roles: super_admin, organizer, checker. API-level role enforcement via composable middleware. Frontend shell with role-filtered nav.

## Technical Context

**Language/Version**: TypeScript ~5.5 (backend + frontend)

**Primary Dependencies**: Express (backend), Next.js 14 App Router (frontend), Chakra UI, TanStack Query, Supabase JS v2, Prisma ORM, Zod, Vitest, Playwright

**Storage**: PostgreSQL via Supabase + Prisma ORM

**Testing**: Vitest (unit/integration), Playwright (E2E)

**Target Platform**: Railway (Node.js backend, Next.js SSR frontend), modern evergreen browsers

**Project Type**: Web application (backend API + Next.js frontend)

**Performance Goals**: User list API <500ms p95 with 10k users; login flow <3s round-trip

**Constraints**: JWT session-based auth (no OAuth for admins); separate `admins` table from `users`; role enforced server-side per-route

**Scale/Scope**: ~10k users, ~50 admins at launch

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution.md is unfilled template — no active gates. Pass.

## Project Structure

### Documentation (this feature)

```text
specs/007-admin-core/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (speckit.tasks)
```

### Source Code

```text
backend/
└── src/
    ├── modules/
    │   ├── admins/
    │   │   ├── admins.routes.ts
    │   │   ├── admins.controller.ts
    │   │   ├── admins.service.ts
    │   │   ├── admins.repository.ts
    │   │   ├── admins.types.ts
    │   │   └── admins.validators.ts
    │   └── surveys/
    │       └── surveys.routes.ts
    │           surveys.controller.ts
    │           surveys.repository.ts
    ├── shared/middlewares/
    │   ├── admin.middleware.ts
    │   └── require-role.middleware.ts

frontend/
└── src/
    ├── features/
    │   ├── admin-auth/
    │   │   ├── components/AdminLoginForm.tsx
    │   │   ├── api/admin-auth.client.ts
    │   │   └── hooks/useAdmin.ts
    │   ├── admin-users/
    │   │   ├── components/UserTable.tsx
    │   │   └── api/admin-users.queries.ts
    │   └── admin-surveys/
    │       ├── components/SurveyResponsesTable.tsx
    │       └── api/admin-surveys.queries.ts
    ├── app/admin/
    │   ├── login/page.tsx
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── usuarios/page.tsx
    │   └── encuestas/page.tsx
    └── shared/components/
        └── AdminSidebar.tsx
```

**Structure Decision**: Monorepo layering per existing pattern — backend modules under `src/modules/<name>/`, frontend features under `src/features/<domain>/`. Routes in `app/` are thin pages delegating to features.

## Complexity Tracking

No constitution violations to justify.
