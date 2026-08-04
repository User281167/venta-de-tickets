# AGENT.md (backend)

Quick reference for agents working in `backend/`. Full rules in root
`constitution.md`.

## Stack
Express + TypeScript + Prisma (Supabase) + Zod + Vitest/Supertest + pino.

## Structure
- `src/modules/<name>/` — all logic. One file per concern, never merge layers.
- Files named `<name>.<layer>.ts`:
  `routes.ts` (path wiring) → `controller.ts` (HTTP + validation via
  validators) → `service.ts` (business) → `repository.ts` (Prisma/DB only).
  Plus `validators.ts` (Zod), `types.ts`, optional `config.ts`/`constants.ts`.
- External integrations in `<name>.client.ts` (module root) or `providers/`
  subfolder (e.g. `payments/providers/epayco`, `donaciones/providers`).
- `src/shared/` — cross-cutting only (middlewares, errors, logger). Never
  domain logic.
- Tests in `test/<module>/` (not co-located).

## Rules
- `service` never imports Express or Supabase directly — only via
  `repository` / `*.client.ts`.
- No cross-module repository access; call other modules' services only.
- Validate all input with Zod (validators) in the controller layer.
- Only Redis usage is Upstash (rate limiting).

## Testing
- Run from `backend/`: `pnpm test`, `pnpm test:watch`, `pnpm lint`,
  `pnpm lint:fix`, `pnpm format`, `pnpm build`.
- Fix all test/type/lint errors until green; add/update tests for changed code,
  even if unasked.

## Conventions
- Code/identifiers: English. Comments: Sapnish.
- Comments only where intent isn't obvious.
- No new abstractions unless there's a concrete current need.
- Prisma/Supabase CLIs never used to modify the DB.
