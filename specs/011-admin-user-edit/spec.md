# Feature Specification: Admin User Edit

**Feature Branch**: `011-admin-user-edit`

**Created**: 2026-07-11

**Status**: Draft

**Input**: "Add edit button to admin users table, modal with form, client validation, connect to PATCH /api/admin/users/:id"

## User Stories

### User Story 1 - Admin edits user profile (Priority: P1)

As an admin, I want to click an edit button on any user row in the users table and edit their profile data in a modal, so I can update user information without leaving the list.

**Independent Test**: Open `/admin/usuarios` → click edit button on a user → modal opens with current data → modify fields → save → modal closes → table reflects changes.

**Acceptance Scenarios**:
1. **Given** the users table, **When** admin clicks the edit button on a row, **Then** a modal opens with current user data pre-filled.
2. **Given** the edit modal, **When** admin modifies fields and clicks "Guardar", **Then** the data is validated client-side and sent via `PATCH /api/admin/users/:id`, modal closes, toast confirms success.
3. **Given** the edit modal, **When** admin clicks "Cancelar", **Then** the modal closes without changes.
4. **Given** the edit modal with invalid data, **When** admin clicks "Guardar", **Then** field-level validation errors are shown and no request is sent.

## Requirements

- **FR-001**: Edit button MUST be in the actions column of each user row.
- **FR-002**: Modal MUST pre-fill with current user data (fullName, email, phone, cedula, role, isActive).
- **FR-003**: Form fields MUST be validated with Zod before submission.
- **FR-004**: Mutation MUST use TanStack Query `useMutation` with optimistic updates or invalidation of the `["admin", "users"]` query key.
- **FR-005**: Toast MUST show success/error feedback.
- **FR-006**: Components MUST be small and separated (dialog, form, etc.).
- **FR-007**: Backend `PATCH /api/admin/users/:id` already exists — no backend changes needed.
