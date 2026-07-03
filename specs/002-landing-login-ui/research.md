# Research: Landing Page & Login UI

## 1. `@supabase/ssr` Setup

### Decision
Use `@supabase/ssr` (next-gen, replaces deprecated `@supabase/auth-helpers-nextjs`).

### Browser client pattern
```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Server client pattern (Next.js 16 — `cookies()` is async)
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

### Middleware/proxy pattern
```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/mi-cuenta')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}
```

**Rules**: Use `getAll()`/`setAll()` only. Call `getUser()` (not `getSession()`) in middleware. Middleware must set cookies on both `request.cookies` and `response.cookies`.

### OAuth callback pattern
```ts
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createServerClient(...) // with cookie store
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}/`)
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
```

### Alternatives Considered
- `@supabase/auth-helpers-nextjs`: Deprecated, replaced by `@supabase/ssr`
- Raw `@supabase/supabase-js` without SSR package: Loses cookie management, requires manual token refresh

---

## 2. Chakra UI v3 (3.36.0) — Provider & Forms

### Decision
Use Chakra UI v3 with `createSystem` API. Component library already installed.

### Provider setup
```tsx
'use client'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ThemeProvider } from 'next-themes'

export function Provider(props: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
    </ChakraProvider>
  )
}
```

### Form components (v3 uses `Field.Root`, not `FormControl`)
```tsx
import { Field, Input, Button } from '@chakra-ui/react'

<Field.Root invalid={!!error}>
  <Field.Label>Email</Field.Label>
  <Input type="email" />
  <Field.ErrorText>{error}</Field.ErrorText>
</Field.Root>
```

### Key v3 diffs
- No `extendTheme` → `createSystem(defaultConfig, config)`
- No `FormControl`/`FormLabel`/`FormErrorMessage` → `Field.Root`/`Field.Label`/`Field.ErrorText`
- `ChakraProvider` takes `value` prop, not `theme`
- Color mode managed by `next-themes` snippets

---

## 3. Next.js 16 Patterns

### Route groups
```
app/
├── (public)/page.tsx        → /
├── (auth)/login/page.tsx    → /login
├── (auth)/registro/page.tsx → /registro
└── auth/callback/route.ts   → /auth/callback
```

### Route handlers
- `app/auth/callback/route.ts` exports `GET` — handles OAuth code exchange
- Server Component by default; `cookies()` is async in Next.js 16

### Middleware → proxy.ts
Next.js 16 supports `proxy.ts` (new convention) alongside `middleware.ts`. The old name still works. Use `proxy.ts` for forward-compatibility.

---

## 4. Auth Patterns

### State flow
1. User submits email/password → `auth.client.ts` calls `signInWithPassword` / `signUp`
2. Supabase responds with session → `AuthProvider`'s `onAuthStateChange` listener updates state
3. On success → redirect to `/`
4. On error → map Supabase error code to Spanish message, show inline

### OAuth flow
1. User clicks "Continuar con Google" → `signInWithOAuth({ provider: 'google', options: { redirectTo } })`
2. Browser navigates to Google consent
3. Google redirects to `/auth/callback?code=...`
4. Route handler calls `exchangeCodeForSession(code)` → sets session cookies
5. Redirect to `/`

### Error message mapping
| Supabase error | Spanish message |
|---|---|
| `Invalid login credentials` | "Correo o contraseña incorrectos" |
| `Email already registered` | "Este correo ya está registrado" |
| `User already registered` | "Este correo ya está registrado" |
| `Email not confirmed` | "Debes confirmar tu correo electrónico" |
| Network error | "Error de conexión. Intente de nuevo." |
| Unknown | "Ocurrió un error. Intente de nuevo." |
