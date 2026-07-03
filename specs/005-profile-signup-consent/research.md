# Research: Profile, Signup & Consent Flow

## Unknowns Resolved

### 1. Consent Recording During Signup
- **Decision**: Consent checkbox on registration form is UX gate only. Formal `privacy_acceptance` backend record created on first `/mi-cuenta` access via existing `PrivacyConsentModal`.
- **Rationale**: User not authenticated during signup (email confirmation required). No new unauthenticated endpoint needed. Existing `POST /api/users/me/privacy-acceptance` + `PrivacyConsentModal` handles the formal record after first login.
- **User metadata flag**: `signUp` call passes `consentGiven: true` in `user_metadata`. On first profile load, `PrivacyConsentModal` pre-checks checkbox if flag present, user just clicks accept.
- **Alternatives considered**: Dedicated unauthenticated consent endpoint (overengineered for v1), storing consent in auth.users raw_app_meta_data (fragile).

### 2. Additional Registration Fields (fullName, phone)
- **Decision**: fullName and phone removed from registration form. User sets them later in profile panel via `PATCH /api/users/me`.
- **Rationale**: DB trigger only copies `full_name` from metadata, not `phone`. Keeping registration lean (email + password + consent). Profile panel already supports editing both fields.
- **Alternatives considered**: Updating the trigger to also handle phone (unnecessary complexity for v1).

### 3. Route Blocking Mechanism for /login and /registro
- **Decision**: Client-side redirect in page components using `useAuth()` — if `user` is truthy and `!isLoading`, call `router.push("/mi-cuenta")`.
- **Rationale**: `LoginForm` already implements this pattern for `/`. Minimal change, consistent with existing code.
- **Alternatives considered**: Next.js middleware (no middleware.ts exists), AuthProvider-level guard (adds coupling).

### 4. Chakra UI v3 Component Patterns
- **Decision**: Follow existing patterns: `Field.Root` + `Field.Label` + `Input` for form fields, `Checkbox.Root` + `Checkbox.Control` + `Checkbox.Label` for consent checkbox, `Button` with `loading` prop for submit.
- **Rationale**: Already established in `RegisterForm.tsx`, `LoginForm.tsx`, `PrivacyConsentModal.tsx`.

### 5. Error Handling Pattern
- **Decision**: Same two-tier pattern as existing forms: `fieldErrors` (per-field Zod validation) + `generalError` (API/server errors). Toast for non-blocking errors.
- **Rationale**: Already established in `RegisterForm.tsx`. Consistent UX.

## Existing Patterns Confirmed

### Modular Folder Structure (User Input Requirement)
- **Backend**: `src/modules/users/` — validators, repository, service, controller, routes
- **Frontend**: `features/auth/` (components, api, schemas, hooks), `features/users/` (components, api, hooks)
- **App routes**: `app/(auth)/login/`, `app/(auth)/registro/`, `app/(protected)/mi-cuenta/`

### Authenticated API Calls
- `features/users/api/users.client.ts` — generic `apiFetch<T>()` wrapper reads Supabase session token, injects `Authorization: Bearer`.
- Existing endpoints: `GET /api/users/me`, `PATCH /api/users/me`, `POST /api/users/me/privacy-acceptance`.

### Auth State
- `AuthProvider` with `onAuthStateChange` subscription. Exposes `{ user, session, isLoading }`.
- `useAuth()` re-exported from `features/auth/hooks/useAuth.ts`.
