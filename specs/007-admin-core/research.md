# Research: Admin Core

All technical decisions pre-defined by user input and existing codebase conventions. No unknowns requiring investigation.

## Key Decisions

| Decision | Choice | Rationale | Alternatives |
|----------|--------|-----------|--------------|
| Admin auth method | Email/password via Supabase Auth | Already have Supabase; no OAuth needed at this scale | Google OAuth (deferred) |
| Role enforcement | Per-route middleware factory `requireRole(...)` | Composable, no god-object middleware | Global guard with big permission table |
| Admin session storage | `@supabase/ssr` browser client (shared) | Same Supabase project, same client; role check is server-side | Separate Supabase anon key (overkill) |
| Admin identity | Separate `admins` table from `users` | Existing convention in AGENTS.md | Shared identity table (rejected) |
| Pagination format | `{ data, total, page, limit }` | Standard, works with TanStack Query | Cursor-based (unnecessary at this scale) |
| Frontend role data | `GET /api/admin/me` endpoint | Avoids client-side JWT decoding | Decode JWT on client (security concern) |
| UI framework | Chakra UI (existing) | Already in stack; consistent look | ShadCN, MUI (churn, no benefit) |
| Data fetching | TanStack Query (existing) | Already in stack; built-in pagination | SWR, RTK Query |

## Dependencies

- `admin.middleware.ts` must query Prisma `admins` table — requires Prisma schema with `admins` model
- `surveys` module already exists from spec `006-onboarding-survey` — extending, not creating
- Frontend Supabase client already set up from `003-auth-jwt-middleware` and `005-profile-signup-consent`

## Integration Points

- Auth middleware (`shared/middlewares/auth.middleware.ts`) from spec `003-auth-jwt-middleware` — reused for JWT verification
- `surveys` module from spec `006-onboarding-survey` — extended with `adminGetOnboarding` controller/service method
- Prisma schema from spec `001-prisma-schema-setup` — may need `admins` model verified
