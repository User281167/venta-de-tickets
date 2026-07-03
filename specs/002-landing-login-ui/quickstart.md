# Quickstart: Landing Page & Login UI

## Prerequisites

- Node.js 20+ with pnpm
- Supabase project with Google OAuth enabled
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in `.env.local`

## Setup

```bash
cd frontend
pnpm install @supabase/ssr
```

## Verification

```bash
pnpm dev
```

Visit:
- `/` — landing page
- `/login` — login form
- `/registro` — register form

## Supabase Dashboard Configuration

1. Enable Google provider in Authentication → Providers
2. Add callback URL: `http://localhost:3000/auth/callback`
3. Under URL Configuration, set Site URL: `http://localhost:3000`

## Build Order (implement in this sequence)

1. `shared/lib/supabase/client.ts` — browser client
2. `shared/lib/supabase/server.ts` — server client
3. `providers/AuthProvider.tsx` + `hooks/useAuth.ts`
4. `features/auth/schemas/auth.schema.ts` — Zod
5. `features/auth/api/auth.client.ts` — Supabase call wrappers
6. `features/auth/components/LoginForm.tsx` + `app/(auth)/login/page.tsx`
7. `features/auth/components/RegisterForm.tsx` + `app/(auth)/registro/page.tsx`
8. `app/auth/callback/route.ts` — OAuth exchange
9. `proxy.ts` — route protection
10. `app/(public)/page.tsx` — landing page UI
11. Manual test pass
