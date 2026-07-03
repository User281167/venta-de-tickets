# Research: Express Auth Middleware (JWT Verification)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Technology Choices

### JWT Verification Library

- **Decision**: `jsonwebtoken` (npm)
- **Rationale**: De facto standard for JWT verification in Node.js/Express. `jwt.verify()` handles signature validation, expiry checking, and claim extraction in one call. No need for `jose` or `jsonwebtoken` alternatives — Supabase issues standard RS256/HS256 JWTs that any compliant library can verify. HS256 is default for Supabase projects (shared secret via `SUPABASE_JWT_SECRET`).
- **Alternatives Considered**: `jose` (pure JS, no native deps — heavier), `jsonwebtoken` wrapper libraries (unnecessary abstraction), Supabase Admin SDK `getUser()` (network call — violates FR-3).

### Express v5 Error Handling

- **Decision**: Express v5 automatically forwards async middleware rejections to the error handler — no explicit `next(err)` wrapper needed.
- **Rationale**: Express v5 (installed) natively supports async error propagation. Middleware functions can `throw` errors or return rejected promises — Express catches them and forwards to the error-handling middleware. This eliminates the need for a `wrapAsync` utility.
- **Pattern**: Error handler middleware uses 4-param signature `(err, req, res, next)` — unchanged from v4.
- **Reference**: https://expressjs.com/en/guide/error-handling.html

### Environment Configuration

- **Decision**: Create `shared/config/env.ts` with Zod schema validation.
- **Rationale**: The project conventions list "Validation: Zod (both ends)." Creating a typed, validated config object is better than scattered `process.env` reads (current `prisma.client.ts` pattern). Validates at startup so missing secrets fail fast.
- **Schema**: `SUPABASE_JWT_SECRET` (string, non-empty), `DATABASE_URL` (string, URL), `PORT` (string, default "3001").

### Type Augmentation for Express

- **Decision**: Module augmentation via `express.d.ts` using declare module.
- **Rationale**: Express v5 exports types. Standard pattern is to augment the `Request` interface. `express-serve-static-core` is the correct module to augment for Express 5's Request type.

### Backend Testing

- **Decision**: Vitest (consistent with project conventions).
- **Rationale**: AGENTS.md lists Vitest for unit/integration tests. Project already uses Vitest in frontend. Backend needs `vitest` + `supertest` for HTTP-level middleware testing. Express v5 compatibility with supertest is confirmed.

### Prisma Client Location for Admin Repository

- **Decision**: `admins.repository.ts` imports the existing `prisma` singleton from `shared/database/prisma.client.ts`.
- **Rationale**: Consistent with existing database access pattern. No new Prisma client instances needed.

## Key Findings

- Supabase JWTs for HS256 use `SUPABASE_JWT_SECRET` (the `anon` key is NOT used for verification — the JWT secret from Supabase dashboard > Settings > API > JWT Settings is required).
- Express v5 no longer requires a manual `next(err)` wrapper for async middleware — `throw` inside `async (req, res, next)` is handled automatically.
- The `admins` table uses UUID PK matching `auth.users.id` via a DB trigger (noted in Prisma schema comments). Admin middleware can query by UUID directly — no email lookup needed.
