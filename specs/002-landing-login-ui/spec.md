# Feature Specification: Landing Page & Login UI

**Feature Branch**: `002-landing-login-ui`

**Created**: 2026-06-30

**Status**: Draft

**Input**: User description: "Landing Page & Login UI. Frontend only. Next.js + Chakra UI. Authentication against Supabase directly from client. Public landing page (/). Login page (/login) - email/password + Google OAuth. Register page (/registro) - email/password sign up. Supabase client setup. Session handling with middleware."

## User Scenarios & Testing

### User Story 1 — Visitor registers and lands authenticated (Priority: P1)

A first-time visitor reaches the platform, navigates to `/registro`, fills in email + password, submits, and is immediately logged in and redirected to the home page.

**Why this priority**: Registration is the entry point for all new users — without it no user can access protected features.

**Independent Test**: Can be fully tested by visiting `/registro`, filling a valid email/password, submitting, and verifying the user is redirected to `/` and the session cookie exists.

**Acceptance Scenarios**:

1. **Given** a visitor is on `/registro`, **When** they submit a valid email and password (min 8 chars), **Then** a Supabase auth user is created, the session is established, and they are redirected to `/`.
2. **Given** a visitor submits a duplicate email on `/registro`, **When** they submit the form, **Then** an inline error "Este correo ya está registrado" is shown.
3. **Given** a visitor submits an invalid email, **When** they submit, **Then** an inline validation error is shown before any API call.

---

### User Story 2 — Returning user logs in with email/password (Priority: P1)

A registered user visits `/login`, enters their credentials, and gains access to their account.

**Why this priority**: Login is the most frequently used auth action — must work reliably for all returning users.

**Independent Test**: Can be tested by registering a user, logging out, revisiting `/login`, entering the same credentials, and verifying the session is restored.

**Acceptance Scenarios**:

1. **Given** a registered user is on `/login`, **When** they enter correct email and password and submit, **Then** they are redirected to `/` (or `/mi-cuenta`).
2. **Given** a user enters a wrong password, **When** they submit, **Then** an inline error "Contraseña incorrecta" is shown.
3. **Given** a user submits an email that doesn't exist, **When** they submit, **Then** an inline error "Este correo no está registrado" is shown.

---

### User Story 3 — User logs in with Google OAuth (Priority: P1)

A user clicks "Continuar con Google" on `/login`, authorizes via Google, and lands authenticated.

**Why this priority**: OAuth is a key onboarding path — simplifies sign-up and reduces password friction.

**Independent Test**: Can be tested by clicking the Google button on `/login`, completing the Google consent flow, and verifying the user lands on `/` authenticated.

**Acceptance Scenarios**:

1. **Given** a visitor is on `/login`, **When** they click "Continuar con Google", **Then** they are redirected to Supabase-hosted Google OAuth flow.
2. **Given** a user completes Google OAuth consent, **When** they return to the app, **Then** they are logged in and redirected to `/`.
3. **Given** a first-time Google OAuth user, **When** they complete the flow, **Then** Supabase Auth trigger creates the matching `public.users` row automatically.

---

### User Story 4 — Authenticated user is redirected away from auth pages (Priority: P2)

A logged-in user navigates to `/login` or `/registro` and is immediately redirected to `/` (or `/mi-cuenta`).

**Why this priority**: Prevents confusion and improves UX for authenticated users who accidentally visit auth pages.

**Independent Test**: Log in, manually type `/login` in the URL bar, verify redirect to `/`.

**Acceptance Scenarios**:

1. **Given** an authenticated user visits `/login`, **When** the page loads, **Then** they are redirected to `/`.
2. **Given** an authenticated user visits `/registro`, **When** the page loads, **Then** they are redirected to `/`.

---

### User Story 5 — Landing page is publicly accessible (Priority: P2)

Any visitor can view the landing page at `/` without authentication.

**Why this priority**: The landing page is the public face of the platform — must be accessible to everyone.

**Independent Test**: Open `/` in an incognito/private browser window — page loads without any auth prompts.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they visit `/`, **Then** the landing page renders with event information, branding, and CTA buttons (no login wall).
2. **Given** an authenticated user, **When** they visit `/`, **Then** they see the same landing page (no redirect).

---

### Edge Cases

- What happens when Supabase is unreachable during login/register? An inline error "Error de conexión. Intente de nuevo." is shown.
- What happens after Google OAuth redirect if the session creation fails? The user sees an error message and is redirected back to `/login`.
- What happens if the user closes the browser mid-OAuth flow? No session — they simply restart from `/login` on next visit.

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow visitors to view the landing page (`/`) without any authentication.
- **FR-002**: System MUST allow users to register with email and password meeting minimum password length (8 characters).
- **FR-003**: System MUST allow users to log in with email and password.
- **FR-004**: System MUST allow users to log in via Google OAuth.
- **FR-005**: System MUST validate email format and password length on the client before submitting to Supabase.
- **FR-006**: System MUST display inline user-friendly error messages for auth failures, not raw Supabase error strings.
- **FR-007**: System MUST redirect authenticated users away from `/login` and `/registro` to `/`.
- **FR-008**: System MUST redirect unauthenticated users away from protected routes (`/mi-cuenta/*`, `/admin/*`) to `/login`.
- **FR-009**: System MUST persist auth session across full page reloads.
- **FR-010**: System MUST make auth state available application-wide via a provider so any component can read the current user.

### Key Entities

- **User Session**: The auth session managed by Supabase browser client. Contains user identity, access token, and refresh token. Available via a context provider throughout the app.
- **Auth Form State**: Client-side state for login/register forms — includes field values, validation errors, and submission status (idle/submitting/error).

## Success Criteria

### Measurable Outcomes

- **SC-001**: A first-time visitor can complete registration and land on the home page in under 30 seconds.
- **SC-002**: A returning user can complete login and land on the home page in under 15 seconds.
- **SC-003**: Google OAuth login completes with at most 2 redirects (app → Google → app) and lands the user authenticated within 10 seconds of Google consent.
- **SC-004**: Session persists — refreshing the page or closing/reopening the browser does not log the user out.
- **SC-005**: All auth error conditions (wrong password, duplicate email, network failure) display a user-friendly inline message — no raw Supabase error codes visible.

## Assumptions

- Supabase Auth has the Google OAuth provider enabled and configured on the project dashboard.
- The Supabase DB trigger that creates `public.users` rows on signup is already in place (previous backend feature).
- No admin login is needed in this feature — admins use a separate auth flow.
- Password reset is out of scope for this feature.
- The landing page design follows the project's Chakra UI visual guidelines (not generic/templated).
- Mobile responsiveness is handled by Chakra UI's responsive primitives as part of normal development.
