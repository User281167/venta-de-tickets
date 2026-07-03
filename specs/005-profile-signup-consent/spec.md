# Feature Specification: Profile, Signup & Consent Flow

**Feature Branch**: `005-profile-signup-consent`

**Created**: 2026-06-30

**Status**: Draft

**Input**: User description: "Build Ui for user profile form and ui of his data and term services and policy accept, add signup add block rutes has login registro if user is already logged"

## User Scenarios & Testing

### User Story 1 — User Registration with Privacy Consent (Priority: P1)

New site visitor arrives at landing page, clicks "Registrarse", fills registration form with email, password, full name, and phone, checks the "Acepto los términos y condiciones y la política de privacidad" checkbox, and submits. System creates account, sends confirmation email, and redirects to login with success message. User confirms email and is redirected to /mi-cuenta where they see their profile data.

**Why this priority**: Registration is the entry point — without it no user can access profile or purchase tickets. The consent checkbox ensures legal compliance (Ley 1581).

**Independent Test**: Can be fully tested by visiting /registro, completing the form with valid data, and confirming the account is created and consent is recorded.

**Acceptance Scenarios**:

1. **Given** a new visitor on /registro, **When** they fill all required fields and check the consent checkbox, **Then** the account is created, consent is recorded, and a confirmation message is shown
2. **Given** a visitor on /registro, **When** they try to submit without checking the consent checkbox, **Then** the form shows an error and submission is blocked
3. **Given** a visitor on /registro, **When** they enter an email already registered, **Then** they see a clear error message
4. **Given** a registered user with confirmed email, **When** they log in for the first time, **Then** they are redirected to /mi-cuenta where they can view their profile

---

### User Story 2 — View and Edit Personal Profile (Priority: P2)

Authenticated user navigates to /mi-cuenta. System displays their personal data (full name, email, phone) in read-only mode. User clicks "Editar", fields become editable, user updates full name and saves. System persists changes and reflects them immediately.

**Why this priority**: Profile management is core to user experience but depends on registration existing first.

**Independent Test**: Can be fully tested by logging in as an existing user, navigating to /mi-cuenta, and editing profile fields.

**Acceptance Scenarios**:

1. **Given** an authenticated user on /mi-cuenta, **When** the page loads, **Then** all profile fields are displayed with current values
2. **Given** an authenticated user viewing their profile, **When** they click "Editar", **Then** fields become editable with save and cancel buttons
3. **Given** a user editing their profile, **When** they modify full name and save, **Then** the change is persisted and displayed
4. **Given** a user editing their profile, **When** they try to set email or an invalid field, **Then** the change is rejected with an error
5. **Given** a user editing their profile, **When** they click "Cancelar", **Then** all fields revert to their original values

---

### User Story 3 — Redirect Authenticated Users from Auth Pages (Priority: P3)

Authenticated user manually navigates to /login or /registro URL. System detects they already have an active session and immediately redirects them to /mi-cuenta.

**Why this priority**: Improves UX by preventing confusion but is not critical for the core registration or profile flow.

**Independent Test**: Can be fully tested by logging in, then navigating to /login — should redirect immediately to /mi-cuenta.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they visit /login, **Then** they are redirected to /mi-cuenta within 1 second
2. **Given** an authenticated user, **When** they visit /registro, **Then** they are redirected to /mi-cuenta within 1 second
3. **Given** an unauthenticated visitor, **When** they visit /login or /registro, **Then** the page loads normally

---

### Edge Cases

- What happens when a user tries to register with an email that already exists but is unconfirmed?
- How does the system handle a user who closes the browser during registration (partial signup)?
- What happens if the privacy acceptance backend endpoint is unavailable during signup?
- How does the system behave when a user's session expires while they are editing their profile?
- What happens when an authenticated user directly navigates to /mi-cuenta? (should load normally)
- What happens when an unauthenticated user navigates to /mi-cuenta? (should redirect to login)

## Requirements

### Functional Requirements

- **FR-001**: Registration form MUST include fields for email, password, password confirmation, and consent checkbox (no personal data fields — full name and phone are set later in profile panel)
- **FR-002**: Registration form MUST include a required checkbox for accepting terms of service and privacy policy
- **FR-003**: System MUST reject registration submission if the consent checkbox is unchecked
- **FR-004**: System MUST block registration submission if consent checkbox is unchecked (formal privacy acceptance recorded by PrivacyConsentModal on first profile access)
- **FR-005**: Profile page MUST display user's full name, email, and phone number in read-only mode by default
- **FR-006**: Profile page MUST have an "Editar" button that switches to edit mode
- **FR-007**: In edit mode, full name and phone MUST be editable; email MUST remain read-only
- **FR-008**: Edit mode MUST have "Guardar" (save) and "Cancelar" buttons
- **FR-009**: System MUST persist allowed field changes (full name, phone) when user clicks save
- **FR-010**: System MUST reject changes to non-allowed fields (email, id) with an error
- **FR-011**: Canceling edit mode MUST revert all fields to their original values
- **FR-012**: Authenticated users visiting /login or /registro MUST be redirected to /mi-cuenta
- **FR-013**: Unauthenticated users visiting /login or /registro MUST see the normal page content

### Key Entities

- **User**: Person registered on the platform. Has email, full name, phone, and account status.
- **Privacy Acceptance**: Record of when a user accepted the privacy policy. Linked to a user, includes policy version, IP address, user agent, and timestamp.
- **Auth Session**: Browser session representing an authenticated user. Determines whether the user sees auth pages or profile.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can complete the full registration flow (form fill + submit + confirmation) in under 3 minutes
- **SC-002**: Profile page loads and displays user data within 2 seconds for authenticated users
- **SC-003**: Authenticated users attempting to visit /login or /registro are redirected within 1 second
- **SC-004**: Profile edits are persisted and visible after page reload
- **SC-005**: All consent checkbox edge cases (unchecked, unchecked after checking, etc.) are handled without page errors

## Assumptions

- Existing authentication system (Supabase Auth) handles email/password registration, email confirmation, and session management
- Existing backend profile and consent endpoints (GET/PATCH /me, POST /me/privacy-acceptance) are reused
- Terms of service and privacy policy text are static for v1 and linked from the consent checkbox label
- Phone field is optional during registration
- Password strength requirements follow existing auth schema rules (minimum 6 characters)
- The registration flow uses email confirmation (magic link or OTP), not immediate access
- Route blocking (redirect from auth pages) applies only to /login and /registro, not to other public pages
- Mobile responsive behavior follows existing Chakra UI patterns already established in the project
