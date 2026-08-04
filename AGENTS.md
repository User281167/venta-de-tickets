<!-- SPECKIT START -->
Current plan: specs/022-audit-log/plan.md
<!-- SPECKIT END -->

# AGENTS.md

Event ticketing platform. Monorepo: `backend/` (Express+TS), `frontend/`
(Next.js App Router), `whatsapp-bot/` (standalone). Colombian market — privacy
(Ley 1581) matters. Full rules in `constitution.md`; read before specs/plans/code.
Conversation/specs: Spanish. Code/identifiers/comments: English.

## Dev environment
- Backend, run from `backend/`: `pnpm dev`, `pnpm build`, `pnpm prisma:generate`.
- Frontend, run from `frontend/`: `pnpm dev`, `pnpm build`.
- Prisma/Supabase CLIs are never used to modify the DB.

## Feature folders (frontend)
- All logic lives in `frontend/features/<domain>/`.
- Subfolders: `components/`, `hooks/`, `api/` (`.client.ts` fetchers +
  TanStack `*.queries.ts`), `schemas/` (Zod), `types/`.
- `app/` is routes/layouts only — no fetching, no logic, no schemas.
- Tests co-located in `__tests__/` next to what they test.

## Modules (backend)
- All logic lives in `backend/src/modules/<name>/`. One file per concern —
  never merge controller, service, repository, etc. into one file.
- Layers, named `<name>.<layer>.ts`:
  `routes.ts` (path wiring) → `controller.ts` (HTTP + validate) →
  `service.ts` (business) → `repository.ts` (Prisma/DB only).
  Plus `validators.ts` (Zod), `types.ts`, optional `config.ts`/`constants.ts`.
- External integrations in `*.client.ts` or `providers/` subfolder.
- No cross-module repo access — call other modules' services only.
- Tests live in `backend/test/<module>/`.

## Testing
- Backend (`backend/`): `pnpm test`, `pnpm test:watch`, `pnpm lint`.
- Frontend (`frontend/`): `pnpm test`, `pnpm test:watch`, `pnpm lint`.
- Fix all test/type/lint errors until green; add/update tests for any code you
  change, even if unasked.
- Always run `pnpm lint` and `pnpm test` for the touched package before commit.

## PR instructions
- Title: `[backend|frontend|whatsapp-bot] <Title>`.