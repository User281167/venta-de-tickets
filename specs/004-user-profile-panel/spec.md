# Feature Specification: User Profile Panel (Personal Data & Privacy Consent)

**Feature Branch**: `004-user-profile-panel`

**Created**: 2026-06-30

**Status**: Draft

**Input**: User description: "User Profile Panel (Personal Data & Privacy Consent)"

## User Scenarios & Testing

### User Story 1 — View Personal Data (Priority: P1)

The user navigates to `/mi-cuenta` and sees their current profile information (name, email, phone, academic program, document ID) as recorded in the system. The view is read-only until the user clicks "Edit".

**Why this priority**: Viewing personal data is the primary entry point for the profile section — without it, no other profile feature is usable.

**Independent Test**: Can be fully tested by navigating to `/mi-cuenta` as an authenticated user and confirming all fields display correctly.

**Acceptance Scenarios**:

1. **Given** an authenticated user with a complete profile, **When** they visit `/mi-cuenta`, **Then** their name, email, phone, academic program, and document ID are displayed.
2. **Given** an authenticated user whose profile has minimal data (only id + email from Supabase Auth), **When** they visit `/mi-cuenta`, **Then** empty fields show a placeholder ("—" or "Not provided") instead of blank space.
3. **Given** an unauthenticated visitor, **When** they attempt to visit `/mi-cuenta`, **Then** they receive a 401 response (redirected to login).

---

### User Story 2 — Edit Personal Data (Priority: P1)

The user clicks "Edit" on their profile, modifies allowed fields (full name, phone, academic program, document ID), saves, and sees the updated values immediately.

**Why this priority**: Users need to keep their information current for event organizers and for compliance purposes.

**Independent Test**: Can be fully tested by editing each allowed field and confirming the new values persist on reload.

**Acceptance Scenarios**:

1. **Given** an authenticated user on `/mi-cuenta`, **When** they edit their full name and save, **Then** the displayed name updates immediately and persists after page reload.
2. **Given** an authenticated user, **When** they attempt to set their email or id via the edit form, **Then** those fields are rejected (not silently ignored) and an error message is shown.
3. **Given** an authenticated user, **When** they submit an edit with invalid data (empty name, invalid phone), **Then** the form shows inline validation errors and no data is saved.

---

### User Story 3 — Privacy Consent Acceptance (Priority: P1)

A user who has never accepted the current privacy policy version is blocked by a consent modal on `/mi-cuenta`. They must read and accept the policy before accessing the profile panel.

**Why this priority**: Colombian law (Ley 1581) requires explicit consent for personal data processing. Blocking access until consent is given ensures compliance.

**Independent Test**: Can be fully tested by clearing consent records and confirming the modal appears, then accepting and confirming access is granted.

**Acceptance Scenarios**:

1. **Given** a user with no recorded privacy acceptance for the current policy version, **When** they visit `/mi-cuenta`, **Then** they see the consent modal and the profile panel is not accessible.
2. **Given** the consent modal is displayed, **When** the user checks the acceptance checkbox and clicks "Accept", **Then** the acceptance is recorded and the profile panel becomes visible.
3. **Given** a user who already accepted the current policy version, **When** they visit `/mi-cuenta`, **Then** they see the profile panel directly — no modal is shown.

---

### User Story 4 — Review Consent Status (Priority: P2)

The user can see their privacy consent status (accepted/not accepted) and the date of their last acceptance from within the profile panel.

**Why this priority**: Transparency about data consent builds user trust and supports compliance with data subject access rights.

**Independent Test**: Can be fully tested by checking consent status display both before and after acceptance.

**Acceptance Scenarios**:

1. **Given** a user who has accepted the privacy policy, **When** they view `/mi-cuenta`, **Then** a "Privacy Consent" section shows "Accepted on [date]" with the policy version.
2. **Given** a user who has not accepted the privacy policy, **When** they view `/mi-cuenta` (after accepting), **Then** no consent status is displayed until they accept.

---

### Edge Cases

- What happens when the backend is unreachable during profile load? A friendly error message with a retry option is shown.
- What happens when the user tries to submit the edit form with unchanged data? No request is sent.
- What happens if the privacy acceptance endpoint is called twice? The second call should succeed without error (idempotent) or return existing record.
- What happens when the user's session expires while on the consent modal? The modal should detect the 401 and redirect to login.

## Requirements

### Functional Requirements

- **FR-001**: System MUST return the authenticated user's profile data (id, email, full name, phone, academic program) via an authenticated endpoint.
- **FR-002**: System MUST allow authenticated users to update their editable profile fields (full name, phone, academic program, document ID) via a secure endpoint.
- **FR-003**: System MUST reject updates to `email` and `id` fields with an error response — these fields are never editable through the profile panel.
- **FR-004**: System MUST validate all profile update payloads against a defined schema on both frontend and backend before persisting changes.
- **FR-005**: System MUST check the user's privacy acceptance status upon loading the profile page.
- **FR-006**: System MUST display a blocking consent modal when a user has no recorded acceptance for the current policy version, preventing access to the profile panel until consent is given.
- **FR-007**: System MUST record privacy consent acceptance with the following audit trail: user id, policy version, acceptance timestamp, IP address (server-detected), and user agent.
- **FR-008**: System MUST allow users to view their consent status (accepted date, policy version) from the profile panel.

### Key Entities

- **User Profile**: Represents the authenticated user's personal data (id, email, full name, phone, academic program, document ID). Linked to Supabase Auth user.
- **Privacy Acceptance**: Records a user's acceptance of a specific privacy policy version. Includes audit fields (user id, policy version, accepted timestamp, IP address, user agent).

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can view their profile data within 2 seconds of page load (under standard network conditions).
- **SC-002**: Profile updates persist and reflect immediately — verified by inspecting the profile page after page reload.
- **SC-003**: Users who have not accepted the current privacy policy are blocked from accessing the profile panel — verified by acceptance test.
- **SC-004**: Consent acceptance is recorded with full audit trail (user id, version, timestamp, IP, user agent) every time — verified by record inspection.
- **SC-005**: Users can understand their consent status (accepted/rejected/not-set) at a glance from the profile panel.

## Assumptions

- Editable fields are: full name, phone, academic program, document ID. The exact set depends on the `users` table schema defined in 001-prisma-schema-setup.
- `policy_version` is tracked as a constant in application code for v1. Future versions may read from configuration or a database table.
- The `users` table already has a row for the authenticated user (created by Supabase Auth trigger as defined in 001-prisma-schema-setup).
- Users access `/mi-cuenta` from a desktop browser; mobile responsiveness is desired but not blocking for v1.
- The system uses the existing authentication middleware (JWT-based) for all profile endpoints.
