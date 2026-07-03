# Implementation Plan: Profile, Signup & Consent Flow

**Branch**: `005-profile-signup-consent` | **Date**: 2026-06-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/005-profile-signup-consent/spec.md`

## Summary

Enhance registration form with fullName, phone, and mandatory consent checkbox. Add redirect for authenticated users on /login and /registro. Reuse existing profile + consent backend endpoints from 004-user-profile-panel. No new API endpoints or database tables.

## Technical Context

**Language/Version**: TypeScript 5.x (backend + frontend)

**Primary Dependencies**: Supabase Auth (signUp with user_metadata), Chakra UI v3 (form components), TanStack Query (useAcceptPrivacy mutation)

**Storage**: Existing — `public.users` + `privacy_acceptances` tables via Prisma ORM

**Testing**: Vitest (frontend component tests), Playwright (E2E)

**Target Platform**: Web — Next.js 16 App Router

**Project Type**: Web application (monorepo: backend Express API + frontend Next.js)

**Performance Goals**: Registration form submittable within 2 seconds, auth redirect completes within 1 second

**Constraints**: No new API endpoints. Consent recorded via existing `POST /api/users/me/privacy-acceptance` after first login. Consent checkbox on signup is UX gate only — formal record created on first profile access.

**Scale/Scope**: All new users. No impact on existing authenticated users.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution file (`.specify/memory/constitution.md`) contains template placeholders — no enforced architectural rules. Project's real architectural rules are in `AGENTS.md`.

**Gate Assessment**: PASS
- **Principle I (Modular structure)**: Feature follows existing `features/<domain>/` pattern. No new modules needed.
- **Principle II (Layered architecture)**: No backend changes. Frontend changes stay within `features/auth/` — correct domain boundary.
- **Principle III (No unnecessary abstractions)**: No new abstractions introduced. Plain `useState` for forms, existing hooks reused.
- **Principle IV (Error handling)**: Follows existing two-tier error pattern (`fieldErrors` + `generalError`).
- **Principle V (Chakra UI v3 patterns)**: Uses existing component patterns from login/register forms.

**Post-Design Re-check**: PASS. No violations introduced.

## Project Structure

### Documentation (this feature)

```text
specs/005-profile-signup-consent/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 — resolved unknowns
├── data-model.md        # Phase 1 — entity model
├── quickstart.md        # Phase 1 — implementation quick reference
├── contracts/           # Phase 1 — API contract references
└── tasks.md             # (future — created by /speckit.tasks)
```

### Source Code (repository root)

```text
frontend/
├── features/
│   ├── auth/
│   │   ├── api/auth.client.ts          # + signUp passes user_metadata
│   │   ├── schemas/auth.schema.ts      # + registerSchema extended
│   │   ├── hooks/useAuth.ts            # unchanged
│   │   └── components/
│   │       ├── RegisterForm.tsx         # + fullName, phone, consent checkbox
│   │       ├── LoginForm.tsx            # unchanged
│   │       └── AuthErrorToast.tsx       # unchanged
│   └── users/
│       ├── api/users.client.ts          # unchanged
│       ├── hooks/useProfile.ts          # unchanged
│       └── components/
│           ├── PrivacyConsentModal.tsx  # + pre-check consent from metadata
│           └── ProfileForm.tsx          # unchanged
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx              # + auth redirect
│   │   └── registro/page.tsx           # + auth redirect
│   └── (protected)/
│       └── mi-cuenta/page.tsx          # unchanged

backend/
└── src/modules/users/                  # unchanged — endpoints from 004 reused
```

**Structure Decision**: Option 2 (Web application — existing frontend + backend structure). No structural changes needed.

## Complexity Tracking

No complexity violations. Feature reuses existing endpoints, adds no new abstractions, and follows established folder/module patterns.

## Implementation Phases

### Phase A — Frontend Schema + API (foundation)
- Extend `registerSchema` in `auth.schema.ts` (fullName, phone, consentGiven)
- Update `signUp()` in `auth.client.ts` to pass `options.data`

### Phase B — RegisterForm UI
- Add fullName, phone Input fields to RegisterForm
- Add consent Checkbox to RegisterForm
- Wire consent checkbox state to submit validation
- FullName and phone included in form data

### Phase C — Route Protection
- Add auth redirect to `/login/page.tsx`
- Add auth redirect to `/registro/page.tsx`

### Phase D — Consent pre-check
- `PrivacyConsentModal` reads user metadata for `consentGiven` flag
- Pre-checks checkbox if flag present
- No change to modal behavior (still requires explicit accept button click)

## Dependencies

- **Blocking**: None — all backend endpoints exist from 004
- **Parallel**: Phase A can run in parallel with Phase C (schema/auth vs route protection, different files)
- **Sequential**: Phase B depends on Phase A (form needs schema + API updates first)
