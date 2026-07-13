# Quickstart: Admin Payments Manager

## Prerequisites

- Backend running (`pnpm dev` in `backend/`)
- Frontend running (`pnpm dev` in `frontend/`)
- Admin user with `super_admin` or `admin` role logged in
- Some payments exist in DB (from ticket purchases)

## Steps to verify

1. Navigate to `/admin/pagos`
2. Verify payment list loads with pagination
3. Test status filter dropdown
4. Test date range filter
5. Test search by user email
6. Click a payment row → verify detail view (user info, tickets, refunds)
7. If payment is `completed`, click "Reembolsar" → enter amount + reason → confirm
8. Verify payment status updates to `refunded` or `partially_refunded`
9. Verify refund appears in payment detail history
10. Test export CSV button on filtered results
