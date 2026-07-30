# Quickstart — Admin Donation Dashboard

## Setup Steps

### 1. Environment Variables

Add to backend `.env`:

```env
# Optional — only for non-super-admin admins
ADMIN_ACCOUNT=LA_CONVENCION
# or ADMIN_ACCOUNT=BARRANQUEROS_UTP
```

### 2. No Database Migration Needed

No schema changes — existing `donations` table is sufficient.

### 3. Verify Donation Module

Admin donation functionality lives within existing `backend/src/modules/donaciones/`. Ensure `donaciones.repository.ts` has new methods before relying on endpoints.

### 4. Verify Messaging Module

Donation email template must exist at `backend/src/modules/messaging/templates/donation-confirmed.html` before email send works.

### 5. Seed Data (for testing)

Insert test donations via Prisma Studio or direct SQL to verify dashboard renders correctly with various states.

### 6. Admin Account for Testing

Ensure at least one user with role `admin` or `super_admin` exists in the `users` table.
