# Implementation Plan: Express Auth Middleware (JWT Verification)

**Branch**: `003-auth-jwt-middleware` | **Date**: 2026-06-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-auth-jwt-middleware/spec.md`

## Summary

Two Express middlewares that validate Supabase-issued JWTs locally using `SUPABASE_JWT_SECRET` and attach `req.user` to authenticated requests. `auth.middleware.ts` handles token verification (401 on failure); `admin.middleware.ts` checks admin table membership post-auth (403 on failure). Builds on greenfield backend — no existing middleware, error classes, config module, or repository layer.

## Technical Context

**Language/Version**: TypeScript 6.0

**Primary Dependencies**:
- `express` ^5.2.1 (already installed — Express v5)
- `jsonwebtoken` + `@types/jsonwebtoken` (to add — local JWT verification)
- `@prisma/client` ^7.8.0 (already installed — admin table query)

**Storage**: PostgreSQL via Prisma ORM (`admins` table already in schema)

**Testing**: Vitest (not yet configured for backend — needs setup)

**Target Platform**: Node.js (Railway hosting), Linux server

**Project Type**: Web API (Express REST backend)

**Performance Goals**: JWT verification completes in <5ms (no network call). Admin table lookup <20ms p95 (local Postgres).

**Constraints**: No path aliases (use relative imports). No existing config/env validation module — must create. No `@types/express` required (Express v5 ships own types). Express v5 async error handling: rejected promises from async middlewares are automatically forwarded to the error handler — no manual `next(err)` wrapper needed.

**Scale/Scope**: 2 middleware files, 2 error classes, 1 repository, 1 config module augmentation. Total ~250 new lines of source code.

## Constitution Check

**GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.**

| Gate | Status | Notes |
|------|--------|-------|
| `shared/` is infrastructure/cross-cutting only | PASS | Middleware and errors are cross-cutting infrastructure — correct placement |
| Service layer never imports Express | PASS | Auth middleware IS infrastructure, not a service; admin middleware imports repository, not service |
| No cross-module repository access | PASS | `admins.repository.ts` belongs to `admins` module; only `admin.middleware` calls it |
| Don't introduce new abstractions without need | PASS | No interfaces/DI/factories — plain functions and classes |
| No path aliases | PASS | Using relative imports consistent with existing `prisma.client.ts` |
| Error handling via existing pattern | PASS (N/A) | No existing pattern yet — establishing first convention |

**Result**: GATE PASSED. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/003-auth-jwt-middleware/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
backend/
└── src/
    └── shared/
        ├── config/
        │   └── env.ts                   # SUPABASE_JWT_SECRET validation (new)
        ├── middlewares/
        │   ├── auth.middleware.ts       # JWT verification, sets req.user
        │   ├── admin.middleware.ts      # Admin table check post-auth
        │   ├── error-handler.middleware.ts  # Catches thrown errors → JSON
        │   └── express.d.ts            # Express type augmentation for req.user
        └── errors/
            ├── UnauthorizedError.ts     # 401
            └── ForbiddenError.ts        # 403

    └── modules/
        └── admins/
            └── admins.repository.ts     # findByUserId()

    └── app.ts                           # Express app setup (created by setup)
    └── server.ts                        # Entry point (created by setup)
```

**Structure Decision**: Monorepo backend with `shared/` for cross-cutting infrastructure (consistent with existing `shared/database/prisma.client.ts` placement) and `modules/` for domain repositories. Middleware and errors land in shared per AGENTS.md: "shared/ is infrastructure/cross-cutting only."

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| No complexity violations | — | — |

## Build Order

Refined from spec's priority ordering:

1. **Error classes** — `UnauthorizedError` (401), `ForbiddenError` (403). Throwable with status code. No dependency on other files.
2. **Error handler middleware** — Express catch-all that serializes `UnauthorizedError`/`ForbiddenError` to `{ error: { code, message } }` JSON. Must exist before auth middleware has a way to surface errors.
3. **Config: `env.ts`** — Zod schema validating `SUPABASE_JWT_SECRET`, `DATABASE_URL`, `PORT` etc. Exports typed `env` object. Needed by auth middleware.
4. **Express type augmentation** — `express.d.ts` declares `Express.User = { id: string; email: string }`. Needed so `req.user` is typed in controllers.
5. **Auth middleware** — Extracts `Bearer <token>`, calls `jwt.verify(token, env.SUPABASE_JWT_SECRET)`, sets `req.user = { id: payload.sub, email: payload.email }`. Throws `UnauthorizedError` on failure.
6. **Admin repository** — `findByUserId(id: string): Promise<Admin | null>`. Prisma query on `admins` table by PK.
7. **Admin middleware** — Reads `req.user.id`, calls `adminsRepo.findByUserId()`. Throws `ForbiddenError` if null, `UnauthorizedError` if auth middleware didn't run first.
8. **Smoke test route** — Wire middlewares to `GET /api/admin/ping` and `GET /api/me` for manual verification.

## Research Tasks (Phase 0)

See [research.md](./research.md).
