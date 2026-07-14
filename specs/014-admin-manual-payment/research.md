# Research: Admin Manual Payment

## Overview

All technical decisions are locked by constitution or existing patterns. No unknowns required research.

## Decisions

### Backend: New endpoint location

- **Decision**: Add route to existing `admins/` module at `POST /admin/payments/manual`
- **Rationale**: All admin payment operations (`list`, `detail`, `refund`) already live under `admins.routes.ts` with `requireRole('admin')` guard. Consistent with existing pattern.
- **Alternatives considered**: New module `admin-payments/` — not needed, adds unnecessary module boundary for a single endpoint.

### Backend: Payment creation logic

- **Decision**: Controller validates via Zod, calls `adminsService.createAdminPayment()` which calls `paymentsService.createAdminPayment()` which calls `paymentsRepository.createAdminPayment()`.
- **Rationale**: Follows existing layered pattern. `adminsService` acts as orchestrator (can add business rules like logging), `paymentsService` for payment-domain logic, `paymentsRepository` for Prisma access. Same pattern as refund flow.
- **Alternatives considered**: Direct controller-to-paymentsService call — skips adminsService orchestration layer inconsistently.

### Backend: `created_by` field

- **Decision**: Nullable UUID, FK to `admins` table. Only set for MANUAL/GIFT provider payments. Null for regular user checkout payments.
- **Rationale**: FK ensures referential integrity. Nullable because existing payments from users don't have a creating admin. Provider check prevents accidental non-null for non-admin payments.
- **Alternatives considered**: Non-null with default — breaks existing payment rows.

### Frontend: Dialog location

- **Decision**: `AddPaymentDialog.tsx` in `features/admin-users/components/`, mutation hook in `features/admin-payments/api/`.
- **Rationale**: Dialog is a user-table action (admin-users domain), API call is a payment operation (admin-payments domain). Keeps concerns separated.
- **Alternatives considered**: Everything in admin-payments — forces cross-feature import for the user table.

### Frontend: Action button

- **Decision**: Add "Pago manual" dropdown option in existing `UserTableItem` actions menu.
- **Rationale**: Users table already has an actions column/button pattern. Adding a menu item is minimal change.
- **Alternatives considered**: Separate action column — more UI changes, inconsistent with existing pattern.

### Prisma schema change

- **Decision**: Add `createdBy` field (optional relation to `Admin` model) to `Payment` model. Maps to `created_by` column in DB.
- **Rationale**: Minimal schema change. Follows Prisma naming conventions (camelCase). Snake_case mapping via `@map`.
- **Alternatives considered**: None — this is the minimal change requested.

## Open Questions

None. All technical aspects are determined by existing patterns and constitution.
