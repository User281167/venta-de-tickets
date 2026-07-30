---

description: "Task list for admin donation dashboard implementation"

---

# Tasks: Admin Donation Dashboard

**Input**: Design documents from `specs/021-donation-dashboard/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

**Tests**: Test tasks included per user request.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, etc.)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo**: `backend/src/`, `frontend/` at repository root
- Frontend: `app/` for routes/layouts, `features/<domain>/` for business logic

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Update middleware, constants, and env config needed by all stories.

- [ ] T001 Add `super_admin` to allowed roles in `backend/src/shared/middlewares/admin.middleware.ts`
- [ ] T002 Add `DONATION_EXPIRY_INTERVAL_MILLIS` constant (20 min) in `backend/src/shared/config/constants.ts`
- [ ] T003 Add `ADMIN_ACCOUNT` env var to `backend/src/shared/config/env.ts` (optional, for admin account scoping)
- [ ] T004 [P] Add `admin-donations` nav link to admin sidebar in `frontend/features/admin/layout/Sidebar.tsx` or equivalent

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend repository methods and Zod schemas that ALL stories depend on.

- [ ] T005 Add `findAllAdmin` method to `backend/src/modules/donaciones/donaciones.repository.ts` (paginated query with state/account/search filters, sorted by createdAt desc)
- [ ] T006 Add `expirePending` method to `backend/src/modules/donaciones/donaciones.repository.ts` (updateMany where state=pending AND createdAt < cutoff → state=cancelled)
- [ ] T007 Add `findById` method to `backend/src/modules/donaciones/donaciones.repository.ts` (find unique by UUID id)
- [ ] T008 Add admin donation query schemas (listFilters, resendParams) in `backend/src/modules/donaciones/donaciones.schema.ts`

**Checkpoint**: Foundation ready — repository can query paginated donations and expire pending.

---

## Phase 3: User Story 1+2 — Admin Dashboard (Priority: P1)

**Goal**: Admin/superadmin can view donation list with filters and account scoping.

**Independent Test**: Superadmin visits `/admin/donaciones`, sees donation table with data. Applies state filter → results change.

### Implementation for User Story 1+2

- [ ] T009 [US1] Add `listDonations` service function in `backend/src/modules/donaciones/donaciones.service.ts` (calls findAllAdmin, handles ADMIN_ACCOUNT scoping for non-superadmin)
- [ ] T010 [US1] Add `listDonations` controller handler in `backend/src/modules/donaciones/donaciones.controller.ts` (validate query with Zod, call service, return JSON)
- [ ] T011 [US1] Register `GET /api/admin/donations` route in `backend/src/modules/admins/admins.routes.ts` with `authMiddleware` + `adminMiddleware` + `requireRole('admin', 'super_admin')`
- [ ] T012 [P] [US1] Create admin donation types in `frontend/features/admin-donations/types/index.ts`
- [ ] T013 [P] [US1] Create TanStack Query hooks in `frontend/features/admin-donations/api/admin-donations.queries.ts` (useDonations with filters)
- [ ] T014 [P] [US1] Create DonationsTableSkeleton component in `frontend/features/admin-donations/components/DonationsTableSkeleton.tsx`
- [ ] T015 [P] [US1] Create DonationsEmpty component in `frontend/features/admin-donations/components/DonationsEmpty.tsx`
- [ ] T016 [P] [US1] Create DonationsFilters component in `frontend/features/admin-donations/components/DonationsFilters.tsx`
- [ ] T017 [P] [US1] Create DonationsTable component in `frontend/features/admin-donations/components/DonationsTable.tsx`
- [ ] T018 [US1] Create DonationsList component (orchestrator) in `frontend/features/admin-donations/components/DonationsList.tsx`
- [ ] T019 [US1] Create page `frontend/app/admin/donaciones/page.tsx` importing DonationsList

**Checkpoint**: Admin dashboard fully functional — table, filters, pagination, account scoping all work.

---

## Phase 4: User Story 3 — Pending Donation Expiry Cron (Priority: P1)

**Goal**: Pending donations older than 20 min auto-cancel via cron job.

**Independent Test**: Insert donation with createdAt = 25 min ago, run job, verify state → cancelled.

### Implementation for User Story 3

- [ ] T020 [US3] Add `sweepExpiredDonations` service function in `backend/src/modules/donaciones/donaciones.service.ts` (calls expirePending, logs count)
- [ ] T021 [US3] Add donation expiry job to `backend/src/shared/jobs.ts` (new `startDonationExpiryJob` using DONATION_EXPIRY_INTERVAL_MILLIS, runs sweepExpiredDonations)
- [ ] T022 [US3] Call `startDonationExpiryJob` from backend startup (same entry point where `startSweepJob` is called)

**Checkpoint**: Cron runs every 20 min, expired donations transition to cancelled.

---

## Phase 5: User Story 4 — Donation Confirmation Email (Priority: P1)

**Goal**: Donor receives confirmation email when donation transitions to confirmed.

**Independent Test**: Create donation, update state to confirmed via webhook simulation, verify email sent with correct template variables.

### Implementation for User Story 4

- [ ] T023 [P] [US4] Create donation-confirmed email template in `backend/src/modules/messaging/templates/donation-confirmed.html` with placeholders `{{donorName}}`, `{{amount}}`, `{{accountName}}`, `{{donationDate}}`
- [ ] T024 [US4] Add `sendDonationConfirmation` function in `backend/src/modules/messaging/messaging.service.ts` (render template, call Resend provider, handle null email skip)
- [ ] T025 [US4] Create donation notification orchestrator in `backend/src/modules/messaging/notifications/donation-notifications.ts` with `notifyDonationConfirmed` (look up donation by ID, call sendDonationConfirmation)
- [ ] T026 [US4] Export `notifyDonationConfirmed` from `backend/src/modules/messaging/index.ts`
- [ ] T027 [US4] Integrate email send in donation webhook handler: call `notifyDonationConfirmed(donationId)` after state changes to confirmed in `backend/src/modules/donaciones/donaciones.service.ts`

**Checkpoint**: Confirmed donations trigger email to donor automatically.

---

## Phase 6: User Story 5 — Admin Email Resend (Priority: P2)

**Goal**: Admin can manually resend donation confirmation email from dashboard.

**Independent Test**: Admin clicks "Reenviar email" on confirmed donation → email sent. Button disabled for pending donations.

### Implementation for User Story 5

- [ ] T028 [US5] Add `resendDonationEmail` service function in `backend/src/modules/donaciones/donaciones.service.ts` (validate confirmed state + non-null email, call sendDonationConfirmation)
- [ ] T029 [US5] Add `resendDonationEmail` controller handler in `backend/src/modules/donaciones/donaciones.controller.ts`
- [ ] T030 [US5] Register `POST /api/admin/donations/:id/resend-email` route in `backend/src/modules/admins/admins.routes.ts`
- [ ] T031 [P] [US5] Add resend query mutation to `frontend/features/admin-donations/api/admin-donations.queries.ts` (useResendDonationEmail)
- [ ] T032 [US5] Add resend button + logic to `frontend/features/admin-donations/components/DonationsTable.tsx` (disabled when not confirmed or null email, success/error toast)

**Checkpoint**: Admin can resend donation email from dashboard table. Button disabled when not applicable.

---

## Phase 7: Tests

**Purpose**: Verify all user stories work independently.

### Tests for User Story 1+2 — Dashboard

- [ ] T033 [P] [US1] Unit test for donation repository `findAllAdmin` in `backend/tests/unit/donaciones/repository.test.ts`
- [ ] T034 [US1] Integration test for `GET /api/admin/donations` endpoint (verify auth, filters, pagination, account scoping)

### Tests for User Story 3 — Cron

- [ ] T035 [US3] Unit test for `expirePending` in `backend/tests/unit/donaciones/repository.test.ts` (verify only pending > 20 min are cancelled)
- [ ] T036 [US3] Integration test for donation expiry sweep (insert test data, run sweep, verify transitions)

### Tests for User Story 4 — Email

- [ ] T037 [US4] Unit test for `sendDonationConfirmation` (verify template rendering, null email skip, error logging)
- [ ] T038 [US4] Integration test for notification flow (webhook → confirmed → email sent)

### Tests for User Story 5 — Resend

- [ ] T039 [US5] Unit test for `resendDonationEmail` (verify validations: confirmed state, non-null email)
- [ ] T040 [US5] Integration test for `POST /api/admin/donations/:id/resend-email` (verify auth, 422 for pending, 200 for confirmed)

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final integration and UI consistency.

- [ ] T041 [P] Add admin sidebar link for "Donaciones" in admin layout (verify active state, icon, label matching existing pattern)
- [ ] T042 Verify all admin endpoints are behind `authMiddleware` + `adminMiddleware` (including new donations routes)
- [ ] T043 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all stories
- **US1+2 Dashboard (Phase 3)**: Depends on Foundational
- **US3 Cron (Phase 4)**: Depends on Foundational — CAN run parallel with Phase 3
- **US4 Email (Phase 5)**: Depends on Foundational — CAN run parallel with Phase 3
- **US5 Resend (Phase 6)**: Depends on US4 (email functions) + US1+2 (frontend dashboard)
- **Tests (Phase 7)**: Depends on all stories implemented
- **Polish (Phase 8)**: Depends on all stories

### User Story Dependencies

- **US1+2 (P1)**: Dashboard — no story dependencies
- **US3 (P1)**: Cron — no story dependencies
- **US4 (P1)**: Email — no story dependencies
- **US5 (P2)**: Resend — depends on US4 email functions + US1+2 frontend

### Within Each Phase

- Models/repository before services
- Services before endpoints
- Backend before frontend
- Story complete before moving to next

### Parallel Opportunities

| Phase | Tasks | Why |
|-------|-------|-----|
| Phase 1 | T001, T002, T003, T004 | Different files, no dependencies |
| Phase 2 | T005, T006, T007, T008 | Repository methods use same file but sequential |
| Phase 3 Backend | T009, T010, T011 | Sequential — service → controller → route |
| Phase 3 Frontend | T012, T013, T014, T015, T016, T017 | All different files, can run in parallel |
| Phase 3 | Backend (T009-011) parallel with Frontend (T012-018) | Independent modules |
| Phase 4 | T020, T021, T022 | Sequential — service → job → startup |
| Phase 5 | T023 parallel with T024-027 | Template independent of service code |
| Phase 3+4+5 | All three can run in parallel | No shared dependencies after Foundational |
| Phase 7 | T033-T040 | Can run in parallel once implementation done |

---

## Parallel Example: Phase 3 Backend + Frontend

```bash
# Backend (sequential):
Task: "Add listDonations service in donaciones.service.ts"
Task: "Add listDonations controller in donaciones.controller.ts"
Task: "Register GET route in admins.routes.ts"

# Frontend (parallel after types):
Task: "Create types in features/admin-donations/types/index.ts"
Task: "Create queries in features/admin-donations/api/admin-donations.queries.ts"
Task: "Create DonationsFilters in features/admin-donations/components/DonationsFilters.tsx"
Task: "Create DonationsTable in features/admin-donations/components/DonationsTable.tsx"
Task: "Create DonationsEmpty in features/admin-donations/components/DonationsEmpty.tsx"
Task: "Create DonationsTableSkeleton in features/admin-donations/components/DonationsTableSkeleton.tsx"
```

---

## Implementation Strategy

### MVP First (Phase 1 + 2 + 3)

1. Complete Setup + Foundational → Foundation ready
2. Complete Phase 3: US1+2 Dashboard (backend + frontend)
3. **STOP and VALIDATE**: Admin can view/filter/search donations
4. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add Phase 3 (Dashboard) → Deploy (MVP! Admin can see donations)
3. Add Phase 4 (Cron) → Deploy (Donations auto-expire)
4. Add Phase 5 (Email) → Deploy (Donors get receipts)
5. Add Phase 6 (Resend) → Deploy (Admin recovery tool)
6. Add Tests → Final validation
7. Polish → Ship

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 1 + 2 together
2. Once Foundational done:
   - Developer A: Phase 3 (Dashboard backend + frontend)
   - Developer B: Phase 4 (Cron) + Phase 5 (Email)
3. Developer A continues to Phase 6 (Resend)
4. Developer B handles Phase 7 (Tests)
5. Team finalizes Phase 8 (Polish)
