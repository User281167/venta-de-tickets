# AGENT.md (frontend)

Quick reference for agents working in `frontend/`. Full rules in root
`constitution.md`.

## Stack
Next.js (App Router) + TypeScript + Chakra UI + TanStack Query + Zod +
Supabase (`@supabase/ssr`).

## Structure
- `app/` — routes and layouts only. No fetching, no business logic, no
  validation schemas here.
- `features/<domain>/` — everything else: `components/`, `hooks/`, `api/`
  (Supabase/fetch calls + TanStack Query hooks), `schemas/` (Zod), `types/`.
- `shared/` — cross-cutting only: generic UI, `lib/` (Supabase clients, query
  client, theme), generic hooks/utils. Never domain logic.
- `providers/` — app-wide context providers (Query, Auth, Chakra).
- `middleware.ts` — route protection (`mi-cuenta/*`, `admin/*`).

## Rules
- Components call `features/*/api/*.client.ts` functions — never call
  `supabase.auth.*` / `fetch` directly inside a component.
- Server-side Supabase client only in Server Components, Route Handlers, and
  `middleware.ts`. Browser client only in Client Components.
- Validate all form input with Zod before submission.
- Use TanStack Query for server state; no manual `useEffect` fetching.
- Follow `frontend-design` skill for visual decisions — avoid generic/default
  styling.
- Never run cli or script for prisma or supabase for modify BD.

## Conventions
- Code/identifiers: English. comments and UI copy: Spanish.
- Comments only where intent isn't obvious.
- No new abstractions unless there's a concrete current need.
