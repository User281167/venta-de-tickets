# Feature Specification: Admin Core

**Feature Branch**: `007-admin-core`

**Created**: 2026-06-30

**Status**: Draft

**Input**: User description: "Admin Core: auth, layout, user list, survey responses"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin logs into the system (Priority: P1)

An admin navigates to the admin login page, enters their email and password, and gains access to the admin panel. The system recognizes their role and shows only the sections they are permitted to use. If they are already logged in, they bypass the login page and go straight to the admin home.

**Why this priority**: Without login, no admin can access any administrative function. This is the foundation for all other admin features.

**Independent Test**: Can be fully tested by visiting the login page, submitting valid credentials, and confirming access to the admin shell.

**Acceptance Scenarios**:

1. **Given** an unauthenticated admin, **When** they visit `/admin/login`, **Then** they see the login form with email and password fields.
2. **Given** an unauthenticated admin, **When** they submit valid email and password, **Then** they are redirected to the admin home page.
3. **Given** an already authenticated admin, **When** they visit `/admin/login`, **Then** they are redirected to `/admin` automatically.
4. **Given** an unauthenticated admin, **When** they submit an invalid email or password, **Then** they see an error message and remain on the login page.

---

### User Story 2 - Admin navigates the protected shell (Priority: P1)

After logging in, the admin sees a sidebar with navigation links relevant to their role. A super_admin or organizer sees links to user list and survey responses. A checker sees only the check-in section (future). All admins see a logout button.

**Why this priority**: The admin shell is the container for all admin experiences. Every admin needs it to do their job.

**Independent Test**: Can be fully tested by logging in as each role and confirming the correct navigation items appear.

**Acceptance Scenarios**:

1. **Given** a logged-in super_admin, **When** they view the admin shell, **Then** the sidebar shows links for user list, survey responses, and logout.
2. **Given** a logged-in organizer, **When** they view the admin shell, **Then** the sidebar shows the same links as super_admin.
3. **Given** a logged-in checker, **When** they view the admin shell, **Then** the sidebar shows only the check-in link (future) and logout — no user list or survey links.
4. **Given** any logged-in admin, **When** they click logout, **Then** their session is cleared and they are redirected to `/admin/login`.

---

### User Story 3 - super_admin or organizer views user list (Priority: P2)

An authorized admin (super_admin or organizer) opens the user list page. They see a paginated table of registered users with name and email. They can search by name or email to find specific users.

**Why this priority**: Viewing users is a core data need for admins managing the event platform.

**Independent Test**: Can be fully tested by logging in as super_admin, navigating to user list, and confirming paginated results and search functionality work.

**Acceptance Scenarios**:

1. **Given** a logged-in super_admin or organizer, **When** they navigate to the user list, **Then** they see a table of users with pagination controls.
2. **Given** an authorized admin on the user list page, **When** they type a search term, **Then** the results filter to matching users by name or email.
3. **Given** a logged-in checker, **When** they attempt to access the user list, **Then** they receive an access denied message.

---

### User Story 4 - super_admin or organizer views onboarding survey responses (Priority: P2)

An authorized admin opens the onboarding survey page. They see a list of all users who completed the onboarding survey along with their responses, user name, and email. This helps them understand attendee profiles.

**Why this priority**: Survey data informs event planning and personalization. Admins need visibility into who has completed onboarding and what their preferences are.

**Independent Test**: Can be fully tested by logging in as super_admin, navigating to survey responses, and confirming user-response pairs display correctly.

**Acceptance Scenarios**:

1. **Given** a logged-in super_admin or organizer, **When** they navigate to the onboarding survey page, **Then** they see each user's name, email, and survey responses.
2. **Given** a logged-in checker, **When** they attempt to access survey responses, **Then** they receive an access denied message.

---

### Edge Cases

- What happens when a regular platform user (not an admin) tries to access any admin page? They should receive an access denied message (403).
- What happens when a visitor who is not logged in at all tries to access admin pages? They should be redirected to the admin login page (401 → redirect).
- What happens when an admin's session expires while they are on a page? They should be redirected to login on their next action.
- What happens when the user list search returns no results? Show a clear "no users found" message.
- What happens when there are no survey responses yet? Show an empty state message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow admins to authenticate using only email and password via a dedicated admin login page.
- **FR-002**: System MUST prevent authenticated admins from accessing the login page — they MUST be redirected to the admin home.
- **FR-003**: System MUST protect all admin pages (except login) from unauthenticated access, redirecting unauthenticated users to the login page.
- **FR-004**: System MUST distinguish between regular users and admins — a valid user session MUST NOT grant access to admin pages.
- **FR-005**: System MUST recognize three admin roles: super_admin, organizer, and checker.
- **FR-006**: System MUST present a navigation sidebar to all authenticated admins with items relevant to their role.
- **FR-007**: super_admin and organizer roles MUST be able to view a paginated list of platform users with search by name or email.
- **FR-008**: checker role MUST NOT be able to view the user list or onboarding survey responses.
- **FR-009**: super_admin and organizer roles MUST be able to view onboarding survey responses along with the respondent's name and email.
- **FR-010**: System MUST provide a logout action that ends the admin session and redirects to the login page.
- **FR-011**: System MUST return appropriate HTTP error codes for unauthorized (401) and forbidden (403) access attempts.

### Key Entities

- **Admin**: A platform user with administrative privileges. Has an identifier, email, name, and role (super_admin, organizer, or checker). Different roles have different levels of access to admin features.
- **Admin Session**: An authenticated session established through email/password login. The session determines which pages and data the admin can access.
- **User**: A regular platform user (not admin). Admins can view a list of users with search functionality.
- **Onboarding Survey Response**: Answers submitted by users during the onboarding process. Each response is associated with a specific user and includes their name and email for identification.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can complete login from visiting `/admin/login` to seeing the admin shell in under 10 seconds on a standard connection.
- **SC-002**: super_admin and organizer can access the user list with search results appearing within 3 seconds of entering a search term.
- **SC-003**: checker attempting to access restricted pages receives an access-denied response every time, with no data leaked.
- **SC-004**: Unauthenticated visitors attempting to access any admin page are redirected to login 100% of the time.
- **SC-005**: Logout clears the session and redirects to login within 2 seconds.
- **SC-006**: Non-admin users with valid sessions receive a forbidden response when accessing any admin page.

## Assumptions

- Admins are provisioned manually in the system (database seeding or direct insertion) — there is no self-registration for admin accounts.
- Email/password authentication is sufficient at the current scale; Google OAuth or other SSO is not needed.
- The existing platform already has a users table with name, email, and onboarding survey data.
- Admins have stable internet connectivity typical of web application usage.
- The three admin roles (super_admin, organizer, checker) cover all current administrative needs — no additional roles are required at this stage.
- Admin management (creating, editing, or deleting admin accounts) is out of scope and will be covered in a future feature.
