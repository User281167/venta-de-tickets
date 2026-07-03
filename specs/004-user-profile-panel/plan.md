# Implementation Plan: User Profile Panel (Personal Data & Privacy Consent)

**Branch**: `004-user-profile-panel` | **Date**: 2026-06-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-user-profile-panel/spec.md`

## Summary

Authenticated `/mi-cuenta` section with profile view/edit and Ley 1581 privacy consent capture. Backend: users module under `backend/src/modules/users/` (controller, service, repository, validators, routes). Frontend: `frontend/src/features/users/` with ProfileForm, PrivacyConsentModal, TanStack Query hooks, and route at `app/mi-cuenta/page.tsx`.

## Technical Context

**Language**: TypeScript 5 (NodeNext moduleResolution, existing stack)

**Primary Dependencies**: Express 5 (backend), Prisma ORM (Postgres), Zod (validation both sides), jsonwebtoken (auth middleware, existing), Chakra UI v3 + TanStack Query v5 (frontend)

**Storage**: PostgreSQL via Supabase — `users` and `privacy_acceptances` tables already exist from 001-prisma-schema-setup

**Testing**: Vitest (backend unit/integration), Playwright (E2E — frontend)

**Target Platform**: Linux server (Railway), Node.js runtime

**Project Type**: Web service (monorepo: backend API + Next.js frontend)

**Performance Goals**: Profile page loads under 2s, mutations under 500ms

**Constraints**: auth.middleware protects all endpoints (jwt.verify), editable-field allowlist enforced server-side, IP address read from `req.ip`/x-forwarded-for never client-supplied

**Scale/Scope**: < 100 concurrent users initially, single privacy policy version

## Constitution Check

*GATE: Passed — constitution is template-only with no defined rules or constraints that this feature violates.*

**No violations.** Feature follows existing module pattern (controller → service → repository), uses established middleware chain, and introduces no new cross-module dependencies.

## Project Structure

### Documentation (this feature)

```
specs/004-user-profile-panel/
├── plan.md              # This file
├── research.md          # Technical decisions
├── data-model.md        # Entity mapping to existing schema
├── quickstart.md        # Developer setup
├── contracts/           # API contracts (endpoints, Zod schemas)
└── tasks.md             # Implementation tasks (/speckit.tasks)
```

### Source Code

```
backend/src/modules/users/
├── users.routes.ts              # GET /me, PATCH /me, POST /me/privacy-acceptance
├── users.controller.ts          # Thin handlers → delegate to service
├── users.service.ts             # Business logic, editable-field allowlist
├── users.repository.ts          # Prisma: findById, update, createPrivacyAcceptance
├── users.validators.ts          # Zod schemas for update payload
├── users.types.ts               # Response types, DTOs
└── index.ts                     # Barrel

frontend/src/features/users/
├── components/
│   ├── ProfileForm.tsx          # Editable profile fields
│   └── PrivacyConsentModal.tsx  # Blocking Ley 1581 consent modal
├── hooks/
│   └── useProfile.ts            # Wraps useMe + useUpdateMe + useAcceptPrivacy
├── api/
│   ├── users.queries.ts         # TanStack Query: useMe, useUpdateMe, useAcceptPrivacy
│   └── users.endpoints.ts       # Fetch wrappers
├── schemas/
│   └── users.schema.ts          # Zod (mirrors backend validators)
└── index.ts                     # Barrel

frontend/src/app/mi-cuenta/
└── page.tsx                     # Composes PrivacyConsentModal | ProfileForm
```

**Structure Decision**: Single backend module under `src/modules/users/` per existing pattern (see `admins/`, `me/`). Frontend feature module under `src/features/users/` per AGENTS.md convention. No cross-module repository access — users module calls only Prisma directly.

## Complexity Tracking

*No violations — feature follows existing patterns without adding new projects or abstractions.*

## Build Order

1. `users.validators.ts` — Zod `updateUserSchema` with allowlist (fullName, phone)
2. `users.repository.ts` — `findById`, `update`, `createPrivacyAcceptance`
3. `users.service.ts` — orchestrate, apply allowlist, consent check
4. `users.controller.ts` + `users.routes.ts` — handlers, express router, auth middleware
5. Wire routes into `backend/src/app.ts`
6. Frontend: `users.schema.ts`, `users.endpoints.ts`, `users.queries.ts`
7. `PrivacyConsentModal.tsx` — reads `me.consentStatus`, calls accept mutation
8. `ProfileForm.tsx` — read-only display → edit toggle → save mutation
9. `app/mi-cuenta/page.tsx` — auth gate, conditional modal, layout
10. Vitest tests for service + middleware chain
11. Manual QA: view, edit, consent flow, reject email/id edit

## Dependencies

- **003-express-auth-middleware**: `auth.middleware`, `UnauthorizedError`, `ForbiddenError`, Express type augmentation (`req.user`)
- **001-prisma-schema-setup**: `users` table (id, fullName, email, phone), `privacy_acceptances` table (userId, policyVersion, policyType, acceptedAt, ipAddress, userAgent)
- **Note**: Schema has no `academicProgram`/`documentId` fields. Spec assumptions about these fields are informational — editable fields are `fullName` and `phone` only.
