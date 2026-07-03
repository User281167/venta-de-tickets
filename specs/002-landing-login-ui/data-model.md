# Data Model: Landing Page & Login UI

## Entities

### User Session (managed by Supabase Auth — not stored locally)

| Field | Type | Description |
|-------|------|-------------|
| `access_token` | string | JWT for authenticated requests |
| `refresh_token` | string | Used to rotate tokens |
| `user.id` | UUID | Matches `public.users.id` |
| `user.email` | string | User's email |
| `user.user_metadata` | object | Full name, avatar, etc. from OAuth |
| `expires_at` | timestamp | Session expiry |

Managed by Supabase Auth. Frontend reads via `supabase.auth.getSession()` / `onAuthStateChange`.

### Auth Form State (client-side only)

| Field | Type | Description |
|-------|------|-------------|
| `email` | string | Email input value |
| `password` | string | Password input value |
| `errors` | `{ email?: string, password?: string, general?: string }` | Zod + Supabase errors |
| `status` | `'idle' \| 'submitting' \| 'error' \| 'success'` | Form submission state |

## Validation Rules

### Login (`loginSchema`)
- `email`: valid email format (Zod `.email()`)
- `password`: min 1 character (non-empty — user typing their existing password)

### Register (`registerSchema`)
- `email`: valid email format (Zod `.email()`)
- `password`: min 8 characters
- `confirmPassword`: must match `password` (Zod `.refine()`)

## State Transitions

### Auth State
```
unauthenticated → (login/register) → authenticated
authenticated → (logout) → unauthenticated
```

### Form State
```
idle → submitting → success (redirect)
idle → submitting → error → idle (user can retry)
```
