# Tasks: Reestructuración solidaria — La U del Futuro 2026

**Input**: Design documents from `/specs/023-solidarity-donation-event/`

**Prerequisites**: `plan.md` and `spec.md`; see also `research.md`, `data-model.md`, and `quickstart.md`.

**Tests**: Add/update backend route and donation tests, frontend route/content/donation tests, and perform a manual browser flow. Run `pnpm test` and `pnpm lint` from every touched package before implementation commit, per repository instructions.

**Organization**: Tasks grouped by user story and dependency. Completed boxes reflect implementation work verified so far.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other `[P]` tasks in the same phase.
- **[Story]**: User story this task supports.
- Tasks name the source or test paths to change.

## Paths

- Backend app/router registration: `backend/src/app.ts`, `backend/src/modules/<name>/*.routes.ts`
- Backend tests: `backend/test/<module>/`
- Frontend route policy/pages: `frontend/proxy.ts`, `frontend/app/`
- Frontend components/features: `frontend/components/`, `frontend/features/<domain>/`
- No database migration or new payment provider.

---

## Phase 1: Setup and Existing Work Review

**Purpose**: Preserve user's existing homepage/assets and identify API exceptions before deactivating routes.

- [X] T001 Review the working tree and supplied assets; confirmed `frontend/app/page.tsx` has no local edits and left supplied UTPton files untouched.
- [X] T002 Inventory Express mounts and routes in `backend/src/app.ts`, admin/donation routers, and ticket/user/me/payment/checkin/confirmation routers.
- [X] T003 [P] Confirm the existing UTPton mapping (`VICTIMAS`), ePayco provider, public counter, automatic counter service, and editable admin meta.
- [X] T004 [P] Inventory public frontend routes, staff login/return paths, donation returns, and current admin navigation.

**Checkpoint**: Known allowlist includes working donations and staff/admin donation-counter access; old public business APIs are enumerated.

---

## Phase 2: Foundational Route Policy

**Purpose**: Test the intended API allowlist before disabling legacy Express mounts.

- [X] T005 [P] Add Supertest coverage in `backend/test/app/route-availability.test.ts` for UTPton donation creation/counter, protected staff/admin donation routes, and retired ticket/user/payment/attendance/admin endpoints.
- [ ] T006 [P] Add route behavior tests next to `frontend/proxy.ts` for legacy public-page redirects and allowed staff login, admin, agenda, and donation-return paths.

**Checkpoint**: Backend and frontend route expectations are executable before route-policy changes.

---

## Phase 3: User Story 1 - Presentar La U del Futuro 2026 y su programación (Priority: P1) 🎯 MVP

**Goal**: The public landing page presents the one-day event and current program, with no ticket-sale or attendee-registration flow.

**Independent Test**: An anonymous visitor opens `/`, identifies the event and 24 October date, reads the program, and sees a donation CTA without ticket/signup calls to action.

### Implementation

- [ ] T007 [P] [US1] Update `frontend/features/landing/components/HeroSection.tsx` with event name, concept, Saturday 24 October 2026, solidarity purpose, and donation CTA; remove entry purchase/signup text.
- [ ] T008 [P] [US1] Replace the previous multi-day activities in `frontend/features/agenda/data/agenda.ts` with the one-day schedule and proposal/evaluation qualifiers from `spec.md`.
- [ ] T009 [US1] Adapt `frontend/features/agenda/components/AgendaTimeline.tsx` and `frontend/features/agenda/components/AgendaHero.tsx` to show one day without obsolete day navigation or ticket-sales copy.
- [ ] T010 [P] [US1] Select and use the relevant UTPton logos/visuals from `frontend/public/assets/utpton/` in the consuming landing components; preserve responsive sizing, contrast, and meaningful alt text.
- [ ] T011 [US1] Recompose `frontend/app/page.tsx` around the new event identity/program and existing working UTPton donation content; integrate current user edits instead of replacing the file wholesale.
- [ ] T012 [P] [US1] Add/update tests under `frontend/features/landing/components/__tests__/` and `frontend/features/agenda/components/__tests__/` for event name/date, agenda content, and no ticket/signup CTA.

**Checkpoint**: The homepage communicates the current event and agenda; donation remains the primary public action.

---

## Phase 4: User Story 2 - Conservar donación UTPton, contador y meta (Priority: P1)

**Goal**: Keep the working donation flow and providers, allow new donations only to UTPton, and preserve the live counter and admin-editable goal.

**Independent Test**: An anonymous visitor completes a sandbox donation to UTPton; its confirmation updates the current counter. Admin changes `metaValue`/`currentValue` and the saved values appear publicly.

### Implementation

- [ ] T013 [P] [US2] Update public copy in `frontend/features/landing/components/DonationSection.tsx`, `frontend/features/donaciones/components/DonationFloat.tsx`, and related donation presentation to name UTPton as the sole destination; remove donor-facing links/options for Asociación de Egresados and Barranqueros.
- [X] T014 [US2] Enforce the UTPton-only destination server-side in `backend/src/modules/donaciones/donaciones.schema.ts`; reject new requests for legacy accounts without changing persisted enum/history.
- [X] T015 [P] [US2] Verify the existing counter and admin goal editor remain data-backed and editable; no static replacement introduced.
- [X] T016 [US2] Preserve and verify admin donation list/counter routes; keep them protected by current role checks.
- [X] T017 [P] [US2] Add backend route/schema coverage and run the existing donation counter and admin donation API tests.
- [ ] T018 [P] [US2] Add/update frontend tests under `frontend/features/donaciones/components/__tests__/` proving only UTPton is offered publicly and the existing counter/meta are rendered from current API values.
- [X] T019 [US2] Update `backend/src/modules/donaciones/README.md` to document the public UTPton destination, retained counter/meta admin operations, and preserved historic account values/webhook handling.

**Checkpoint**: Existing donation checkout remains functional; new donations have one UTPton destination; counter and configurable goal remain live.

---

## Phase 5: User Story 3 - Deshabilitar APIs y páginas del modelo anterior (Priority: P1)

**Goal**: Legacy ticket, regular-user, ticket-payment, and attendance functionality cannot be reached through frontend pages or direct Express requests; staff can still sign in and manage donations.

**Independent Test**: Call old backend routes directly and verify they do not execute; use legacy frontend URLs and verify redirects; log in as admin and verify donation list/counter remain operational.

### Backend Implementation

- [X] T020 [US3] Disable old ticket, client, payment, confirmation, check-in, ticket-admin, analytics, and audit mounts; keep donation and required auth/admin mounts.
- [X] T021 [US3] Reduce admin routes to staff identity and donation list/counter administration; deactivate user-management and ticket-payment routes.
- [X] T022 [US3] Keep route source files and business modules; verified removed mounts return unavailable to an authenticated admin.
- [X] T023 [P] [US3] Add route coverage for disabled direct endpoints and retained staff/admin donation protection.

### Frontend Implementation

- [ ] T024 [P] [US3] Update `frontend/proxy.ts` to send obsolete ticket, checkout, registration, regular account, ticket, and check-in paths to `/`; preserve staff login/recovery/callback, admin donation pages, current agenda, and donation return paths.
- [ ] T025 [US3] Update `frontend/app/(auth)/login/page.tsx` so authorized admin staff can sign in but a `client` role cannot complete sign-in and is returned to `/`.
- [ ] T026 [US3] Disable public self-registration in `frontend/app/(auth)/registro/page.tsx` while retaining page/component source.
- [ ] T027 [P] [US3] Update `frontend/components/layout/Navbar.tsx`, `frontend/shared/components/AdminSidebar.tsx`, and `frontend/app/admin/page.tsx` to remove public purchase/account links and no-longer-active admin modules; retain admin entry and donation management/meta link for authorized roles.
- [ ] T028 [P] [US3] Add/update frontend tests for `frontend/proxy.ts`, login/registration, and admin navigation covering anonymous, `client`, `admin`, and `super_admin` access.

**Checkpoint**: Only the UTPton donation public API and the staff/admin donation operations remain active; old pages and modules are retained but inaccessible.

---

## Phase 6: User Story 4 - Explicar propósito y marco institucional (Priority: P2)

**Goal**: Explain the revised program and solidarity purpose consistently, including legal content.

**Independent Test**: Review the public event and legal content for the one-day date, four programmatic axes, single UTPton donation destination, and no superseded ticket-sales claims.

### Implementation

- [ ] T029 [P] [US4] Add/update a purpose section under `frontend/features/landing/components/` describing IA/future, employment/reactivation, alumni encounter, and solidarity/memory/reconstruction.
- [ ] T030 [P] [US4] Update `frontend/app/(public)/terminos/page.tsx` to remove superseded event entry/QR/registration claims and retain accurate UTPton donation terms.
- [ ] T031 [P] [US4] Update `frontend/app/(public)/privacidad/page.tsx` to remove obsolete ticket/account purposes from the current public journey and preserve required donation/data-protection disclosures.
- [ ] T032 [US4] Add/update content tests under `frontend/features/landing/components/__tests__/` for program order, tentative modalities/artists, memorial wording, and the UTPton donation destination.

**Checkpoint**: Public copy, event schedule, donation destination, and legal content agree.

---

## Phase 7: Polish and Cross-Cutting Validation

**Purpose**: Validate the integrated experience and package quality gates.

- [ ] T033 [P] Run the manual acceptance steps in `specs/023-solidarity-donation-event/quickstart.md`, including staff, legacy routes, and sandbox donation/counter flow.
- [ ] T034 [P] Review resources used by `frontend/` from `frontend/public/assets/utpton/` for correct variant, readability, broken paths, and accessible text alternatives.
- [ ] T035 Run `pnpm test` from `backend/` and resolve regressions in route availability and existing donation behavior.
- [ ] T036 Run `pnpm lint` from `backend/` and resolve lint errors in touched files.
- [ ] T037 Run `pnpm test` from `frontend/` and resolve regressions in landing, donation, auth, navigation, and route behavior.
- [ ] T038 Run `pnpm lint` from `frontend/` and resolve lint errors in touched files.

**Checkpoint**: Acceptance criteria and both touched packages' required checks pass before implementation commit.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; inventory current user edits, endpoints, and counter first.
- **Foundation (Phase 2)**: Depends on inventory; backend/frontend allowlist tests block route changes.
- **US1 (Phase 3)**: Depends on the asset/content inventory.
- **US2 (Phase 4)**: Depends on confirming existing UTPton account/provider mapping; preserve counter behavior while restricting new destination values.
- **US3 (Phase 5)**: Depends on route allowlist tests and the admin donation exception identified in US2.
- **US4 (Phase 6)**: Uses the approved date/program from the spec; can proceed alongside backend/frontend access tasks.
- **Polish (Phase 7)**: Depends on all selected stories.

### User Story Dependencies

- **US1 (P1)**: Landing and one-day program; no backend dependency.
- **US2 (P1)**: Reuses existing donation provider and counter; server-side destination allowlist change is required.
- **US3 (P1)**: Preserves US2 public/admin donation routes while disabling all legacy business APIs.
- **US4 (P2)**: Depends on approved content from US1 and US2.

### Parallel Opportunities

- T003 and T004 can run in parallel after T001/T002.
- T005 and T006 are separate backend/frontend test files.
- Within US1, T007, T008, T010, and T012 touch separate files; T009 depends on T008 and T011 integrates the sections.
- Within US2, T013, T015, T017, and T018 can proceed in parallel after account mapping is confirmed.
- In US3, backend route edits (T020–T023) and frontend route/nav edits (T024–T028) can proceed in parallel after tests specify the allowlist.
- In US4, rationale, terms, privacy, and content tests touch separate files.

## Implementation Strategy

### MVP First

1. Complete route, asset, destination, and counter inventory (Phase 1).
2. Add route-availability coverage (Phase 2).
3. Deliver the one-day public homepage (US1) and UTPton-only donation plus existing counter/meta (US2).
4. Disable legacy APIs and pages while retaining staff/auth/donation admin exceptions (US3).
5. Update rationale/legal content (US4), then validate both packages.

### Validation Notes

- Check a task only after its described work is implemented and verified.
- Backend route/schema tests, existing donation counter/API tests, and backend TypeScript checking have been run for the completed backend tasks.
- No payment sandbox, full-package test suite, lint, or build has been run.
- Preserve supplied files in `frontend/public/assets/utpton/`; `frontend/app/page.tsx` had no local edits when implementation began.
