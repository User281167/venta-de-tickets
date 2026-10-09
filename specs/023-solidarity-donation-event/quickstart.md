# Quickstart: Reestructuración solidaria — La U del Futuro 2026

## Prerequisites

- Frontend and backend dependencies installed and environment files configured using each package's existing setup guide.
- Backend connected to the usual development/staging environment; no schema or database migration is part of this feature.
- Use the existing donation provider in sandbox/test mode for payment validation.

## Run locally

Start backend from `backend/`:

```bash
pnpm dev
```

Start frontend from `frontend/`:

```bash
pnpm dev
```

## Acceptance walkthrough

1. Open `/` signed out. Confirm event name, Saturday 24 October 2026, solidarity purpose, UTPton identity, updated navigation, and no ticket/signup CTA.
2. Scroll through the event rationale and one-day program. Confirm every activity/time from `spec.md` and preserve tentative qualifiers.
3. Open donation as an anonymous visitor. Confirm there is one destination only (UTPton), no account requirement, and the existing provider starts successfully. Verify success, pending, failure, and return states.
4. Confirm the public counter shows the existing current amount and configured goal. After a sandbox donation is confirmed, confirm the current value increases using the existing behavior.
5. Sign in as an authorized admin. Open donation administration, change the goal/current counter value, save, and confirm the public counter reflects the saved values. Restore staging values after the check.
6. As authorized admin, confirm donation list and counter configuration still work. Confirm entry/user/payment/analytics/audit admin features are no longer presented as active functions.
7. Visit obsolete frontend routes directly: ticket listing/selection, cart/checkout, registration, regular account, tickets, and check-in. Confirm each redirects to `/` without affecting donation returns.
8. Call legacy Express routes directly (ticket listings, checkout, user/profile, ticket confirmation/check-in, and old payment routes) and confirm they do not reach business handlers. Confirm current donation endpoints and required staff/admin donation endpoints remain available.
9. Visit `/login` directly as staff. Confirm admin/super-admin authentication and donation admin access remain; confirm `client` cannot complete sign-in or access admin.
10. Review terms/privacy, images, keyboard focus, contrast, and responsive layout on desktop and mobile. Confirm no old ticket-sale claims or alternate donation destinations appear publicly.

## Automated checks

Run from each touched package per its `AGENTS.md`:

```bash
# backend/
pnpm test
pnpm lint

# frontend/
pnpm test
pnpm lint
```

No tests, lint, build, or payment sandbox run was performed while preparing this plan.

