# Quickstart: Admin Core

## Prerequisites

- Backend running (`npm run dev` from `backend/`)
- Frontend running (`npm run dev` from `frontend/`)
- Prisma schema has `admins` model (verify with `npx prisma studio`)
- Supabase Auth enabled for email/password sign-ins
- Admin user seeded in `admins` table (role: `super_admin`)

## Verify Setup

```bash
# 1. Check Prisma schema has admins table
cd backend && npx prisma db push --dry-run

# 2. Run backend tests
npx vitest run --reporter=verbose src/modules/admins/
npx vitest run --reporter=verbose src/shared/middlewares/admin.middleware.test.ts

# 3. Run frontend tests
cd frontend && npx vitest run --reporter=verbose src/features/admin-auth/
```

## Manual Smoke Test

1. Open `http://localhost:3000/admin/login` — see login form
2. Enter admin credentials → redirected to `/admin`
3. Sidebar shows nav links based on role
4. Navigate to `/admin/usuarios` — see paginated user list
5. Navigate to `/admin/encuestas` — see survey responses
6. Click logout → redirected to `/admin/login`
7. Visit `/admin/usuarios` directly without session → redirected to login
8. Login as checker → verify user list and surveys return 403

## Build Order (per user plan)

| Step | Component | Depends On |
|------|-----------|------------|
| 1 | `backend/src/modules/admins/` (types, repository, service, controller, routes) | Existing Prisma + Supabase |
| 2 | `backend/src/shared/middlewares/admin.middleware.ts` | Admins repository |
| 3 | `backend/src/shared/middlewares/require-role.middleware.ts` | None |
| 4 | `backend/src/modules/surveys/` — extend with `adminGetOnboarding` | Existing surveys module |
| 5 | `frontend/src/features/admin-auth/` (login form, useAdmin hook) | Backend `/admin/me` |
| 6 | `frontend/src/shared/components/AdminSidebar.tsx` | useAdmin hook |
| 7 | `frontend/src/app/admin/layout.tsx` + `login/page.tsx` + `page.tsx` | AdminSidebar, useAdmin |
| 8 | `frontend/src/features/admin-users/` + `app/admin/usuarios/page.tsx` | Backend `/admin/users` |
| 9 | `frontend/src/features/admin-surveys/` + `app/admin/encuestas/page.tsx` | Backend `/admin/surveys/onboarding` |

Steps 8 and 9 can be built in parallel.
