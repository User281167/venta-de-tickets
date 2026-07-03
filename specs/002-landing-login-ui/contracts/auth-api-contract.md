# Auth API Contract

## `features/auth/api/auth.client.ts`

Functions exported from the auth API layer. Components import these — never call `supabase.auth.*` directly.

### `signInWithPassword(email: string, password: string): Promise<AuthResult>`

Maps to `supabase.auth.signInWithPassword({ email, password })`.

**Returns**:
```ts
type AuthResult =
  | { success: true; error: null }
  | { success: false; error: string }  // User-facing Spanish string
```

### `signUp(email: string, password: string): Promise<AuthResult>`

Maps to `supabase.auth.signUp({ email, password })`.

**Returns**: Same as `signInWithPassword`.

### `signInWithGoogle(): Promise<void>`

Maps to `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })`.

Handles the redirect — no return value. On return from Google, `/auth/callback` handles session setup.

### `signOut(): Promise<void>`

Maps to `supabase.auth.signOut()`.

## Auth Provider Contract

### `providers/AuthProvider.tsx`

Wraps the app. Exposes auth state via `useAuth()` hook.

**Context value**:
```ts
type AuthContextValue = {
  user: User | null          // Supabase User object or null
  session: Session | null    // Supabase Session or null
  isLoading: boolean         // True during initial session restore
}
```

### `features/auth/hooks/useAuth.ts`

```ts
function useAuth(): AuthContextValue
```

Throws if called outside `AuthProvider`.

### No direct `supabase.auth.*` calls in components

Components use `useAuth()` for reading state and `auth.client.ts` functions for mutations. Never import `@/shared/lib/supabase/client` directly in a component.
