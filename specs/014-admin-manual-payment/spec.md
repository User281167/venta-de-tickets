# Feature Specification: Admin Manual Payment

**Feature Branch**: `014-admin-manual-payment`

**Created**: 2026-07-13

**Status**: Draft

**Input**: User description: "create admin add manual payment. admin select in usuarios page in action buttons payment (add payment) in user table. Backend create payment with provider MANUAL. add created_by field. same flow for gift provider. only need created_by in payments table"

## User Scenarios & Testing

### User Story 1 - Admin creates a manual payment for a user (Priority: P1)

Admin navigates to Usuarios page, finds a user in the table, clicks "Add payment" action button. System opens payment creation dialog where admin selects provider (Manual or Gift), enters amount and concept. On submit, backend creates a payment record with the chosen provider, associates it with the user, and records the admin who created it via `created_by`.

**Why this priority**: Core functionality — enables admins to record off-platform payments (cash, bank transfer) and gift tickets.

**Independent Test**: Can be fully tested by logging in as admin, navigating to Usuarios, selecting a user, clicking "Add payment", selecting "Manual" provider, filling amount, submitting, and verifying payment appears in user's payment history.

**Acceptance Scenarios**:

1. **Given** an admin is on the Usuarios page viewing a user's action buttons, **When** admin clicks "Add payment", **Then** a payment creation dialog opens with provider options (Manual, Gift).
2. **Given** the payment dialog is open with "Manual" selected, **When** admin fills amount and concept and submits, **Then** a payment is created with provider = MANUAL, associated with the selected user, and `created_by` set to the admin's ID.
3. **Given** the payment dialog is open with "Gift" selected, **When** admin fills amount and submits, **Then** a payment is created with provider = GIFT, associated with the selected user, and `created_by` set to the admin's ID.
4. **Given** admin submits payment creation, **When** the request succeeds, **Then** the payment appears in the user's payment history immediately.
5. **Given** admin submits payment creation with invalid data (missing amount), **When** validation fails, **Then** a clear error message is shown and no payment is created.

---

### Edge Cases

- What happens when the target user does not exist or is inactive? System returns error and does not create payment.
- What happens when the admin session expires during payment creation? System prompts re-authentication before proceeding.
- What happens when the payment provider field is not MANUAL or GIFT for admin-created payments? Backend rejects with validation error.

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide an "Add payment" action button on each user row in the Usuarios admin table.
- **FR-002**: System MUST present a payment creation dialog when admin clicks "Add payment", with provider options: Manual and Gift.
- **FR-003**: Admin MUST be able to select the payment provider (MANUAL or GIFT) before submitting.
- **FR-004**: Admin MUST specify payment amount and concept/description.
- **FR-005**: Backend MUST create a payment record with provider set to the selected value (MANUAL or GIFT).
- **FR-006**: Backend MUST set `created_by` on the payment record to the authenticated admin's user ID.
- **FR-007**: Backend MUST associate the payment with the selected target user.
- **FR-008**: Backend MUST validate that only admin users can create payments with provider MANUAL or GIFT.
- **FR-009**: System MUST display the newly created payment in the target user's payment history immediately after creation.
- **FR-010**: Backend MUST reject payment creation if required fields (amount, provider) are missing with a clear validation error.

### Key Entities

- **Payment**: Represents a payment transaction. Key attributes: amount, provider (MANUAL, GIFT, or other auto-generated providers), status, target user, `created_by` (admin user ID who created it), concept/description. New `created_by` field records which admin created the payment.
- **Admin**: Authenticated staff user who manages payments. Identified in the system via their admin session.
- **User**: End customer who receives the payment. The payment is associated with this user.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Admin can create a manual or gift payment for any user in under 60 seconds from the Usuarios page.
- **SC-002**: All admin-created payments are correctly attributed to the creating admin via the `created_by` field.
- **SC-003**: 100% of admin-created payments appear in the target user's payment history without manual intervention.
- **SC-004**: Error rate for payment creation is below 1% (excluding intentional validation errors from invalid input).

## Assumptions

- Admin authentication and session management already exist in the system.
- The Usuarios page already has an action buttons column in the user table.
- Payment creation requires no external payment gateway interaction for MANUAL or GIFT providers.
- The `created_by` field stores the admin user ID from the admins table (not the users table).
- Only authenticated admins can access the payment creation functionality.
- Existing payment history display already works for users and will show new payments automatically.
