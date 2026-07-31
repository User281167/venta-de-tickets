# Quickstart — Admin Donation Dashboard

## Setup Steps

### 1. No Environment Variables Required

Admin endpoint visibility does not require extra env vars. Both `admin` and `super_admin` users see all donations across both accounts.

### 2. No Database Migration Needed

No schema changes — existing `donations` table is sufficient.

### 3. Verify Donation Module

Admin donation functionality lives within existing `backend/src/modules/donaciones/`. Ensure `donaciones.repository.ts` has new methods (`findAllAdmin`, `findById`, `expirePending`) before relying on endpoints.

### 4. Verify Messaging Module

Donation email templates must exist at:
- `backend/src/modules/messaging/templates/donation-confirmed.html`
- `backend/src/modules/messaging/templates/donation-rejected.html`
- `backend/src/modules/messaging/templates/donation-cancelled.html`

Templates are loaded at runtime by `renderTemplate`.

### 5. Cron Job

`startDonationExpiryJob()` starts automatically with the backend. It runs every 20 minutes and cancels any pending donation older than 20 minutes, sending a cancellation email per expired donation.

### 6. Seed Data (for testing)

Insert test donations via Prisma Studio or direct SQL to verify dashboard renders correctly with various states.

### 7. Admin Account for Testing

Ensure at least one user with role `admin` or `super_admin` exists in the `users` table.
