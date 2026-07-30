# Feature Specification: Admin Donation Dashboard

**Feature Branch**: `021-donation-dashboard`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "Implement admin donation dashboard, cron for update pending each 20min, same time as payment, dashboard for see user donations from superadmin and admin, transactional email for donation with template and resend"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Views Donation Dashboard (Priority: P1)

Admin or superadmin navigates to admin panel, sees list of all donations with donor name, email, amount, account, status, and date. Can filter by status and account. Can search by donor name or email.

**Why this priority**: Core visibility — without this, admins have no way to monitor donation activity.

**Independent Test**: Superadmin logs in, visits `/admin/donaciones`, sees donation table with real data. Can apply filters and verify results change.

**Acceptance Scenarios**:

1. **Given** admin logged in with role `admin` or `super_admin`, **When** they navigate to donations page, **Then** they see table with columns: name, email, amount, account, status, created date
2. **Given** donation table loaded, **When** admin clicks "Pendientes" filter, **Then** only pending donations display
3. **Given** donation table loaded, **When** admin types "Juan" in search, **Then** table filters to matching donors
4. **Given** donation table loaded, **When** admin clicks column header "Fecha", **Then** rows sort by date ascending/descending
5. **Given** user has role `client`, **When** they access `/admin/donaciones`, **Then** they receive 403 unauthorized

---

### User Story 2 - Superadmin Sees All Accounts, Admin Sees by Role (Priority: P1)

Superadmin views donations for both accounts (LA_CONVENCION, BARRANQUEROS_UTP). Regular admin sees only donations for their assigned account.

**Why this priority**: Access control is critical — Barranqueros UTP admin should not see La Convención donations.

**Independent Test**: Create two admin accounts, one per account. Verify each sees only their account's donations. Verify superadmin sees all.

**Acceptance Scenarios**:

1. **Given** superadmin logged in, **When** donations page loads, **Then** table includes donations from all accounts
2. **Given** admin for LA_CONVENCION logged in, **When** donations page loads, **Then** only LA_CONVENCION donations appear
3. **Given** admin for BARRANQUEROS_UTP logged in, **When** donations page loads, **Then** only BARRANQUEROS_UTP donations appear

---

### User Story 3 - Pending Donations Expire After 20 Minutes (Priority: P1)

System runs a cron job every 20 minutes that marks donations stuck in `pending` state for more than 20 minutes as `cancelled`. Matches the same timeout used for payment reservations.

**Why this priority**: Prevents accumulation of stale pending donations. Same timeout as payment ensures consistency.

**Independent Test**: Create donation with pending status and createdAt 25 minutes ago. Run cron manually or wait for next tick. Verify donation transitions to `cancelled`.

**Acceptance Scenarios**:

1. **Given** donation has state `pending` and `createdAt` older than 20 minutes, **When** cron runs, **Then** state changes to `cancelled`
2. **Given** donation has state `pending` and `createdAt` younger than 20 minutes, **When** cron runs, **Then** state remains `pending`
3. **Given** donation has state `confirmed`, **When** cron runs, **Then** state stays `confirmed`
4. **Given** no pending donations older than 20 minutes, **When** cron runs, **Then** no rows affected

---

### User Story 4 - Donor Receives Confirmation Email (Priority: P1)

When a donation transitions from `pending` to `confirmed`, the system sends a donation-confirmed email to the donor using the Resend provider with a dedicated template.

**Why this priority**: Donors need receipt of their contribution. Uses existing messaging infrastructure.

**Independent Test**: Create donation, manually update state to confirmed via webhook. Verify donor email sent with correct template variables.

**Acceptance Scenarios**:

1. **Given** donation exists with state `pending`, **When** webhook updates state to `confirmed`, **Then** donor receives email to `donation.email` with template `donation-confirmed`
2. **Given** donation confirmation email sent, **When** rendered, **Then** includes donor name (or "Anónimo"), amount formatted in COP, account name, and date
3. **Given** donor email is null, **When** donation is confirmed, **Then** no email is attempted (silent skip)
4. **Given** Resend API returns error during send, **When** email fails, **Then** error is logged and donation flow completes without disruption

---

### User Story 5 - Admin Resends Donation Email (Priority: P2)

Admin can manually resend the donation confirmation email from the dashboard for any confirmed donation.

**Why this priority**: P2 because it's a recovery mechanism — primary delivery happens automatically. Useful when donor claims they didn't receive the email.

**Independent Test**: Admin clicks "Reenviar email" on confirmed donation with email address. Verify email is sent. Verify button shows success feedback.

**Acceptance Scenarios**:

1. **Given** admin viewing donation with state `confirmed` and non-null email, **When** they click "Reenviar email", **Then** donation confirmation email is resent to the donor's email
2. **Given** admin viewing donation with state `pending`, **When** they click "Reenviar email", **Then** button is disabled with tooltip "Donación no confirmada"
3. **Given** admin resends email, **When** send completes, **Then** success toast displays "Email reenviado exitosamente"
4. **Given** Resend API fails during resend, **When** error occurs, **Then** error toast displays and error is logged

---

### Edge Cases

- Donation with null email: admin sees "Sin email" in table; resend button disabled
- Donation with anonymous donor (null full_name): table shows "Anónimo" consistently
- Cron overlaps with webhook update for same donation: first writer wins, no data loss
- Large donation volume: table paginates with server-side pagination (50 per page)
- Admin session expires: redirect to login, preserve intended URL

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide admin-only route `/admin/donaciones` accessible to users with role `super_admin` or `admin`
- **FR-002**: System MUST display donation table with columns: full_name, email, amountCents, account, state, createdAt
- **FR-003**: System MUST filter donations by state (pending/confirmed/rejected/cancelled) via query parameter
- **FR-004**: System MUST filter donations by account (LA_CONVENCION/BARRANQUEROS_UTP) via query parameter
- **FR-005**: System MUST search donations by partial match on full_name or email
- **FR-006**: System MUST paginate results server-side, 50 per page, with page parameter
- **FR-007**: System MUST sort results by createdAt descending by default
- **FR-008**: Super_admin users MUST see donations for all accounts
- **FR-009**: Admin users MUST see only donations for the account they manage (determined by admin profile or env)
- **FR-010**: Non-admin users MUST receive 403 when accessing the donations admin page
- **FR-011**: Backend MUST expose GET `/api/admin/donations` endpoint returning paginated donation list with filters
- **FR-012**: Backend MUST expose POST `/api/admin/donations/:id/resend-email` endpoint for email resend
- **FR-013**: System MUST run a cron job every 20 minutes (matching payment reservation timeout) that marks `pending` donations older than 20 minutes as `cancelled`
- **FR-014**: Cron job MUST run in the same shared job infrastructure as the existing payment sweep
- **FR-015**: Cron job MUST log count of expired donations on each run
- **FR-016**: System MUST send donation-confirmed email via existing Resend provider when donation transitions to `confirmed`
- **FR-017**: Email template `donation-confirmed` MUST include variables: donorName (or "Anónimo"), amount (COP formatted), accountName, donationDate
- **FR-018**: Email MUST NOT be sent if donation has no email address (null email)
- **FR-019**: Email sending MUST be fire-and-forget, non-blocking for webhook response
- **FR-020**: Email send failures MUST be logged without affecting donation state transition
- **FR-021**: Resend button MUST be visible for confirmed donations only, disabled otherwise with tooltip
- **FR-022**: Resend button MUST show loading state during send and success/error feedback

### Key Entities *(include if feature involves data)*

- **Donation**: Existing entity — represents a donation transaction. Extended with admin dashboard views and email notifications.
- **Admin Donation View**: Server-side paginated projection of Donation table for admin consumption, filtered by admin account scope.
- **DonationExpiryJob**: Cron task running every 20 minutes scanning pending donations older than threshold, marking them cancelled.
- **DonationEmailTemplate**: HTML template `donation-confirmed.html` with `{{donorName}}`, `{{amount}}`, `{{accountName}}`, `{{donationDate}}` placeholders.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin dashboard loads donation list in under 2 seconds for up to 1000 donations
- **SC-002**: Filters (state, account, search) return results in under 500ms
- **SC-003**: Cron job processes all expired pending donations in under 5 seconds per run
- **SC-004**: 100% of confirmed donations with a valid email receive a confirmation email (excluding provider delivery failures)
- **SC-005**: Email resend completes in under 3 seconds with visible success feedback
- **SC-006**: 0% of expired donations remain in pending state after cron run (verified post-run)
- **SC-007**: Role-based access enforced correctly: 100% of client requests to admin route return 403
- **SC-008**: Account-scoped admins see exactly 0 donations from other accounts

## Assumptions

- Admin account scope (which account they manage) is configured via environment variable `ADMIN_ACCOUNT` or derived from admin user metadata; super_admin sees all
- Existing messaging module infrastructure (Resend provider, template renderer) is reused for donation emails
- Existing shared job infrastructure (`startSweepJob` in `jobs.ts`) is extended with the donation expiry job
- Frontend uses existing Chakra UI table and admin layout components following patterns in `/admin/pagos`
- Donation timeout of 20 minutes matches the existing `RESERVATION_EXPIRATION_INTERNAL_MILLIS` constant
- No dedicated "admin" table exists — admin/super_admin are roles in the existing `users` table
- Backend endpoint path follows existing convention: `/api/admin/donations`
- Frontend route follows existing convention: `/admin/donaciones`
