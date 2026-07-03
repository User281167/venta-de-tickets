# Implementation Plan: Landing Page & Login UI

**Branch**: `002-landing-login-ui` | **Date**: 2026-06-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-landing-login-ui/spec.md`

## Summary

Public landing page at `/`, login page at `/login` (email/password + Google OAuth), register page at `/registro` (email/password). Built in `frontend/` — Next.js App Router + Chakra UI v3 + `@supabase/ssr`. No Express API involved. Session management via Supabase browser + server clients, `proxy.ts` route protection, and `AuthProvider` for app-wide auth state.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16, React 19

**Primary Dependencies**: `@supabase/ssr` (latest), `@chakra-ui/react` 3.36.0, `zod`, `next-themes`

**Storage**: N/A — auth sessions managed via Supabase (cookie-based)

**Testing**: Vitest (unit/integration) + Playwright (E2E), per project conventions

**Target Platform**: Web — modern browsers (Chrome, Firefox, Safari, Edge)

**Project Type**: Web application (Next.js App Router frontend)

**Performance Goals**: Forms respond within 200ms of submission. OAuth redirect completes within 5s of Google consent.

**Constraints**: `@supabase/ssr` cookie API uses `getAll()`/`setAll()` only. `proxy.ts` must call `getUser()` (not `getSession()`) to trigger token refresh.

**Scale/Scope**: Consumer-facing auth for Colombian event ticketing platform. 10k+ users.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Stack compliance (Next.js + Chakra + Supabase) | PASS | Per existing frontend/AGENTS.md and package.json |
| Feature layering: `features/<domain>/` | PASS | Auth components/hooks/api live under `features/auth/` |
| No cross-module repository access | PASS | Frontend only — no backend repository calls |
| Components call `features/*/api/*.client.ts` | PASS | Auth API calls abstracted in `features/auth/api/auth.client.ts` |
| `app/` routes/layouts only — no business logic | PASS | Pages import from features, no inline Supabase calls |
| Code identifiers English, UI copy Spanish | PASS | Form labels/errors in Spanish |
| No new abstractions without current need | PASS | Standard patterns — provider, hook, form components |
| No Express API endpoints | PASS | Out of scope by spec |

## Project Structure

### Documentation (this feature)

```
specs/002-landing-login-ui/
├── plan.md               # This file
├── research.md           # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/            # Phase 1 output
└── tasks.md              # Phase 2 output (not created here)
```

### Source Code (repository root)

```
frontend/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   └── page.tsx                 Landing page
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx             Login page
│   │   │   └── registro/
│   │   │       └── page.tsx             Register page
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts             OAuth code exchange handler
│   │   ├── layout.tsx                   Root layout (Provider wrappers)
│   │   └── (protected)/
│   │       └── mi-cuenta/
│   │           └── page.tsx             Placeholder protected page
│   ├── features/
│   │   └── auth/
│   │       ├── components/
│   │       │   ├── LoginForm.tsx
│   │       │   └── RegisterForm.tsx
│   │       ├── hooks/
│   │       │   └── useAuth.ts
│   │       ├── api/
│   │       │   └── auth.client.ts
│   │       └── schemas/
│   │           └── auth.schema.ts
│   ├── shared/
│   │   └── lib/
│   │       └── supabase/
│   │           ├── client.ts            Browser client
│   │           └── server.ts            Server client (RSC/middleware)
│   ├── providers/
│   │   └── AuthProvider.tsx
│   └── middleware.ts
│       (or proxy.ts — Next.js 16 convention)
```

**Structure Decision**: Web application — frontend only. File layout matches frontend/AGENTS.md conventions.

## Complexity Tracking

None. Constitution gates pass without violations.

## Build Order

1. Install `@supabase/ssr`
2. Supabase client setup (`shared/lib/supabase/client.ts`, `server.ts`)
3. `AuthProvider` + `useAuth` hook
4. `auth.schema.ts` (Zod)
5. `auth.client.ts` (Supabase auth wrappers)
6. `LoginForm` + `/login` page
7. `RegisterForm` + `/registro` page
8. `/auth/callback/route.ts` OAuth handler
9. `proxy.ts` route protection
10. Landing page UI at `/`
11. Manual test pass
