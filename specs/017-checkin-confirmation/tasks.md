# Tasks: Check-in and Remote Confirmation

**Input**: Design documents from `specs/017-checkin-confirmation/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included — user explicitly requests race condition tests.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Path Conventions

- **Backend**: `src/modules/checkin/`, `src/modules/confirmations/` at repository root
- **Tests**: `backend/tests/` (project convention — Vitest)

---

## Phase 1: Setup

**Purpose**: Clean slate and environment configuration

- [x] T001 Delete existing `src/modules/checkin/` entirely (old single-endpoint `POST /internal/checkin` attempt)
- [x] T002 [P] Add `CONFIRMATION_JWT_SECRET`, `CONFIRMATION_TOKEN_TTL`, `CONFIRMATION_LINK_BASE_URL` to `src/env.ts` and `.env.example`
- [x] T003 [P] Create `src/modules/checkin/checkin.types.ts` with `TicketSummary` type, `CheckerAction` union, and pure function `getAllowedActions(status): CheckerAction[]`
- [x] T004 [P] Create `src/modules/checkin/checkin.validators.ts` with `scanSchema` and `ticketActionSchema` Zod schemas

**Checkpoint**: Foundation ready — types and validators available for all stories

---

## Phase 3: User Story 1 — Direct Entry (Priority: P1) 🎯 MVP

**Goal**: Checker scans QR, ticket is in `paid` state, buyer present — direct confirm-entry. Ticket transitions `paid → used`. Scanned ticket info displayed for any status.

**Independent Test**: Scan QR for `paid` ticket → `confirm_entry_direct` appears in allowedActions → call confirm-entry → response 200 → scan again → status is `used` with `checkedInAt` timestamp.

### Implementation for User Story 1

- [x] T005 [US1] Create `src/modules/checkin/checkin.repository.ts` with: `findTicketForScan(ticketId)` (no lock), `confirmEntryDirect(ticketId, checkerId)`, `requestConfirmation(ticketId, checkerId)`, `allowEntry(ticketId, checkerId)`, `confirmTicket(ticketId)`, `rejectConfirmation(ticketId)` — fix the bug where `rejectConfirmation` doesn't distinguish success from error (return boolean or affected count)
- [x] T006 [US1] Create `src/modules/checkin/checkin.service.ts` with `scanTicket(qrToken)` (decode JWT via `QR_JWT_SECRET`, call `findTicketForScan`, compute `allowedActions` via `getAllowedActions`) and `confirmEntryDirect(ticketId, checkerId)` (transition `paid → used`, map affected-rows-zero to `TICKET_NOT_AVAILABLE`)
- [x] T007 [US1] Create `src/modules/checkin/checkin.controller.ts` with Express handlers for `POST /scan` and `POST /confirm-entry` — validate body with Zod, call service, map errors to status codes
- [x] T008 [US1] Create `src/modules/checkin/checkin.routes.ts` — `Router()` mounting controller handlers, apply `requireRole('checker', 'admin')` middleware

**Checkpoint**: Direct entry flow functional — checker can scan, see ticket info, and confirm entry. MVP deliverable.

---

## Phase 4: User Story 2 — Remote Confirmation (Priority: P1)

**Goal**: Checker scans QR for `paid` ticket, buyer not present — requests confirmation. Buyer clicks link → ticket becomes `confirmed`. Checker scans again → sees `allow_entry` action → allows entry. Also covers User Story 3 (buyer reject).

**Independent Test**: Scan QR for `paid` ticket → request-confirmation → status becomes `pending_confirmation` → call confirmations confirm endpoint with valid JWT → status becomes `confirmed` → scan → `allow_entry` appears → allow-entry → status `used`.

### Implementation for User Story 2

- [x] T009 [US2] Create `src/modules/messaging/` module — `messaging.types.ts` (`MessagingClient` interface, `ConfirmationLinkPayload`, `MessagingChannel`), `messaging.client.ts` (`ConsoleMessagingClient` stub), `index.ts` re-export. checkin imports via `../messaging/index.js`
- [x] T010 [US2] Complete `src/modules/checkin/checkin.service.ts`: add `requestConfirmation(ticketId, checkerId)` (transition `paid → pending_confirmation`, generate confirmation JWT signed with `CONFIRMATION_JWT_SECRET`, build confirmation link, call `messaging.client.sendConfirmationLink`, log only `ticketId` — never log the JWT) and `allowEntry(ticketId, checkerId)` (transition `confirmed → used`)
- [x] T011 [US2] Create `src/modules/confirmations/confirmations.middleware.ts` — verifies `CONFIRMATION_JWT_SECRET`, checks `purpose: 'confirm'`, attaches decoded `ticketId` to `req`, distinguishes `TokenExpiredError` vs `JsonWebTokenError`
- [x] T012 [US2] Create `src/modules/confirmations/confirmations.types.ts` (response types, error codes)
- [x] T013 [US2] Create `src/modules/confirmations/confirmations.validators.ts` — Zod schemas for confirm and reject (token required, non-empty string)
- [x] T014 [US2] Create `src/modules/confirmations/confirmations.service.ts` with `confirm(ticketId)` (transition `pending_confirmation → confirmed` via `checkin.repository.confirmTicket`) and `reject(ticketId)` (transition `pending_confirmation → paid` via `checkin.repository.rejectConfirmation`)
- [x] T015 [US2] Create `src/modules/confirmations/confirmations.controller.ts` with handlers for `POST /confirm` and `POST /reject` — parse token from body, verify via middleware, extract `ticketId`, call service, map errors
- [x] T016 [US2] Create `src/modules/confirmations/confirmations.routes.ts` — `Router()` mounting controller handlers (no session auth — authenticated by confirmation JWT middleware)

**Checkpoint**: Full remote confirmation flow works — scan → request → buyer confirms/rejects → scan again → allow entry.

---

## Phase 5: Wire Routes & Polish

**Purpose**: Mount both routers in main app and finalize

- [x] T017 Mount `checkin.routes` on `/internal/checkin` and `confirmations.routes` on `/confirmations` in main Express app (`src/app.ts` or equivalent entry point)
- [x] T018 Write Vitest race condition test: two concurrent `confirm-entry` requests on the same ticket → first returns 200, second returns 409 `TICKET_NOT_AVAILABLE` (use `Promise.all` to fire both simultaneously)

**Checkpoint**: All endpoints wired and verified.

---

## Phase 6: Documentation

- [x] T019 Update `docs/spec-tickets-lifecycle.md` to include `pending_confirmation ⇄ paid ⇄ confirmed` transitions in state diagram

---

## Phase 7: Foundational (Frontend) — Blocking All Frontend Stories

**Purpose**: Project structure, API client, schemas, page placeholder, and the QR scanner library must exist before any checker UI story can render.

> **Backend prerequisite**: Phases 1–6 must be complete (all 19 backend tasks). The frontend talks to `/internal/checkin/*` endpoints implemented by the backend module.

- [x] T020 [P] Create directory structure `frontend/features/checkin/` with subfolders `api/`, `components/`, `hooks/`, `schemas/`, `components/__tests__/`
- [x] T021 [P] Create `frontend/features/checkin/schemas/checkin.schema.ts` with Zod schemas inferred to types: `scanResponseSchema` (parses `TicketSummary` from backend: `ticketId`, `status`, `attendeeName`, `attendeeCedula: string | null`, `ticketTypeName`, `checkedInAt: string | null`, `allowedActions: CheckerAction[]`), `ticketActionInputSchema` (`ticketId: string.uuid()`), `checkerActionSchema` (enum: `confirm_entry_direct | request_confirmation | allow_entry`)
- [x] T022 [P] Create `frontend/features/checkin/api/checkin.endpoints.ts` — 4 functions using `authFetch` from `@/shared/api/admin-fetch` to `${BASE_URL}/internal/checkin/*`: `scanQr(qrToken)` → parses response with `scanResponseSchema`; `confirmEntry(ticketId)`, `requestConfirmation(ticketId)`, `allowEntry(ticketId)` → return `void`. All wrap non-2xx in `ApiError` with the backend `error.code` preserved
- [x] T023 [P] Create `frontend/features/checkin/api/checkin.queries.ts` — TanStack Query hooks: `useScanTicket()` (mutation, called imperatively from scanner), `useConfirmEntry()`, `useRequestConfirmation()`, `useAllowEntry()` (all mutations). No query keys needed — mutations only. Each mutation exposes `mutate`, `mutateAsync`, `isPending`, `error`
- [x] T024 Add `qr-scanner` (npm package, ~50KB, MIT, uses native `BarcodeDetector` with WASM fallback; works on mobile Safari/Chrome) to `frontend/package.json` `dependencies` and run `pnpm install`. **Do not use `qrcode.react` — it only renders QRs**
- [x] T025 [P] Create `frontend/app/admin/checkin/page.tsx` — minimal client page that renders `<CheckinSection />` imported from `@/features/checkin/components/CheckinSection`. Add a route-level comment stating "this page is accessible to any admin role including `checker`; no `ROLE_RESTRICTED_PATHS` entry should block it"

**Checkpoint**: Feature folder wired. Endpoints + queries importable from any client component. `qr-scanner` installed. Page route exists. No user-visible UI yet.

---

## Phase 8: User Story 1 — Page access restricted to admin and checker (Priority: P1) 🎯

**Goal**: A user with role `checker` (or `admin`/`super_admin`) can navigate to `/admin/checkin`. Users with role `client` cannot.

**Why this priority**: Required for any other story — if the page is unreachable, no UI can be tested. The project already partially enforces this in `proxy.ts` and `admin/layout.tsx`; this story confirms and documents the behavior.

**Independent Test**: As a logged-in `checker`, navigate to `/admin/checkin` → page renders. As a logged-in `client`, navigate to the same URL → redirected to `/`. As an anonymous user, redirected to `/login`.

### Implementation for User Story 1

- [x] T026 [US1] Verify and document role-guard behavior in two files: (a) `frontend/proxy.ts` — confirm `ADMIN_ROLES` set contains `"checker"` (it does); add a code comment above the set declaring which roles can reach `/admin/*`. (b) `frontend/app/admin/layout.tsx` — confirm `ROLE_RESTRICTED_PATHS` does **not** include `"/admin/checkin"` (so `checker` is allowed); add a code comment above the map documenting the intent. No functional change required if both already hold.

**Checkpoint**: `/admin/checkin` is reachable for checker/admin/super_admin and blocked for client/anonymous. No new feature code yet.

---

## Phase 9: User Story 2 — Scan QR and display ticket summary (Priority: P1) 🎯 MVP

**Goal**: The page opens the device camera, decodes any QR, sends the token to the backend `/scan` endpoint, and shows the ticket summary (name, cedula, ticket type, status, allowed actions) so the checker can read the attendee's ID at the door.

**Why this priority**: Core read flow. The checker cannot decide which action to take (US3) without first seeing the ticket. US2 is the natural MVP deliverable — scan + read works on its own, even before any action buttons exist.

**Independent Test**: Open `/admin/checkin` on a mobile device (or laptop with webcam). Grant camera permission. Point camera at any QR containing a valid `QR_JWT_SECRET`-signed token. UI shows the ticket summary within 2s. For an invalid QR, UI shows an error toast and allows rescan. For a used ticket, UI shows "Ya usado" without action buttons.

### Implementation for User Story 2

- [x] T027 [P] [US2] Create `frontend/features/checkin/components/QrScanner.tsx` (client component) — uses `qr-scanner` library to open rear camera, decode one QR, call `onScan(decodedText: string)` once, then pause scanner until `resume()` is called externally. Includes: (a) camera permission denied state with retry button, (b) "manual entry" fallback text input that emits the same `onScan` event when submitted (for dev/staging without camera), (c) "Cancelar / Escanear otro" button to reset. Props: `onScan: (text: string) => void`, `paused: boolean`, `onResume: () => void`
- [x] T028 [P] [US2] Create `frontend/features/checkin/components/TicketSummaryCard.tsx` (client component) — receives `ticket` of type inferred from `scanResponseSchema`. Displays: attendee full name, cedula (show `"Sin cédula registrada"` when `attendeeCedula === null`), ticket type name, status badge (via `<StatusBadge>`), and `checkedInAt` formatted in `es-CO` locale if present. Uses Chakra UI `Card`, `Stack`, `Text`; styled per project theme (no generic defaults)
- [x] T029 [P] [US2] Create `frontend/features/checkin/components/StatusBadge.tsx` (client component) — props `status: TicketStatus`. Returns a Chakra `Badge` with color: `paid`=green, `pending_confirmation`=yellow, `confirmed`=blue, `used`=gray, `reserved`=orange, `cancelled`=red, `expired`=red. Label in Spanish (e.g., `used` → "Usado", `pending_confirmation` → "Pendiente de confirmación")
- [x] T030 [US2] Create `frontend/features/checkin/hooks/useCheckinSession.ts` — encapsulates the scan state machine: `currentTicket` (last successful scan or `null`), `isScanning` (boolean), `error` (string | null), `lastScannedToken` (string | null — used to avoid re-scanning the same QR). Exposes `scan(qrToken)`, `clearSession()`, `resumeScanner()`. Internally uses `useScanTicket`. On successful scan, auto-pauses the scanner (passes `paused={true}` to `<QrScanner>`)
- [x] T031 [US2] Create `frontend/features/checkin/components/CheckinSection.tsx` (client component) — top-level section. Layout: header "Check-in" + `<QrScanner paused={!isScanning} onScan={scan} onResume={resumeScanner} />` + (when `currentTicket`) `<TicketSummaryCard ticket={currentTicket} />` + (placeholder div) where `<ActionButtons>` will mount in US3. Wires `useCheckinSession`. On scan error, shows `sonner` toast with backend `error.code` mapped to Spanish (e.g., `INVALID_QR` → "QR inválido o expirado", `NOT_FOUND` → "Ticket no encontrado")

**Checkpoint**: Checker can scan any QR, see the ticket summary, and handle the error cases. The page is fully usable as a read-only inspector (US3 will add write actions).

---

## Phase 10: User Story 3 — Action buttons (confirm entry, request confirmation, allow entry) (Priority: P1)

**Goal**: After a successful scan, the checker sees one of three action buttons (or none) based on the backend's `allowedActions`. Each button calls the corresponding mutation, shows a success toast, and resets the session so the next attendee can be scanned.

**Why this priority**: These are the three state-transition actions that make the feature useful. Without them, US2 is just a read-only viewer.

**Independent Test**: Scan a `paid` ticket owned by the buyer → see "Confirmar entrada directa" button. Press it → success toast "Entrada confirmada" + after 3s the scanner auto-resumes. Scan the same ticket again → see "Ya usado" badge with no buttons. Scan a `paid` ticket whose buyer is not the attendee → see "Pedir confirmación al comprador" button. Press it → success toast "Link enviado al comprador" + ticket shown with a "Pendiente" overlay (no buttons). Simulate the buyer confirming via the test endpoint, scan again → see "Permitir ingreso" button. Press it → success toast + auto-reset.

**Dependency**: Depends on US2 (T031) — the action buttons mount inside `<CheckinSection>` and need `currentTicket` from the session.

### Implementation for User Story 3

- [x] T032 [P] [US3] Create `frontend/features/checkin/components/ActionButtons.tsx` (client component) — props: `ticket` (TicketSummary), `onSuccess: (action: CheckerAction) => void`. Renders one button per entry in `ticket.allowedActions`: `confirm_entry_direct` → primary button "Confirmar entrada directa" (calls `useConfirmEntry`), `request_confirmation` → outline button "Pedir confirmación al comprador" (calls `useRequestConfirmation`), `allow_entry` → primary button "Permitir ingreso" (calls `useAllowEntry`). Each button shows a `Spinner` while its mutation is pending. Disables all buttons while any mutation is in flight. Does not render anything if `allowedActions` is empty
- [x] T033 [P] [US3] Create `frontend/features/checkin/components/ConfirmationPendingOverlay.tsx` (client component) — props `attendeeName: string`. Renders a translucent Chakra `Box` over the `<TicketSummaryCard>` with copy: "Esperando confirmación del comprador. Vuelve a escanear cuando el comprador haya confirmado." (Spanish). Imported by `<CheckinSection>` when `currentTicket.status === 'pending_confirmation'`
- [x] T034 [US3] Extend `frontend/features/checkin/hooks/useCheckinSession.ts` to handle mutation results: add `lastAction` (`CheckerAction | null`) and `onActionSuccess` callback. Wire three new mutations (`useConfirmEntry`, `useRequestConfirmation`, `useAllowEntry`). On success of `confirm_entry_direct` or `allow_entry`: show `sonner.success("Entrada confirmada" / "Ingreso permitido")` and call `clearSession()` after 3s. On success of `request_confirmation`: show `sonner.success("Link de confirmación enviado al comprador")` and keep the ticket visible (do not clear). Update `<CheckinSection>` to render `<ConfirmationPendingOverlay>` when `currentTicket.status === 'pending_confirmation'`

**Checkpoint**: Full state-transition UI works end-to-end. Checker can confirm direct entries, request remote confirmations, and allow entry after remote confirmation.

---

## Phase 11: User Story 4 — Navbar shows Check-in button for checker role (Priority: P2)

**Goal**: When a user with role `checker` is logged in, the navbar shows: "Mi cuenta" + "Check-in" (or "Escanear"). The "Check-in" button is hidden for other roles. "Mi cuenta" is already shown for any authenticated user.

**Why this priority**: Discoverability — without the navbar button, the checker does not know the page exists. P2 because the URL is still reachable directly while this ships.

**Independent Test**: Log in as `checker` → navbar shows "Mi cuenta" and "Check-in" buttons. Log in as `client` → navbar shows "Mi cuenta" only. Log in as `admin` (without `checker`) → navbar shows "Admin" + "Mi cuenta" but not "Check-in" (admin uses a different code path for support tasks).

### Implementation for User Story 4

- [x] T035 [P] [US4] Add `isCheckerRole(r: string | null): boolean` helper to `frontend/providers/AuthProvider.tsx` — returns `r === "checker"` only (NOT `admin` or `super_admin`; they access the checkin flow from the admin ticket pages, not the navbar). Export alongside the existing `isAdminRole`
- [x] T036 [P] [US4] Update `frontend/components/layout/Navbar.tsx` to render a new "Check-in" button when `isCheckerRole(role)` is true. Use `@tabler/icons-react` `IconQrcode`. Link target: `/admin/checkin`. Apply in BOTH the desktop HStack (near the existing Admin button, around line 110) AND the mobile menu drawer (around line 240). Use the same `asChild` + `<NextLink>` pattern as the existing Admin button for consistent navigation. Button label: "Check-in" (matches the Spanish UI convention used elsewhere)
- [x] T037 [US4] Verify "Mi cuenta" button is still rendered for all authenticated users regardless of role. The existing Navbar code at line 134 already gates on `user` only, so this should hold without code change. If during implementation the button is found to be accidentally gated on admin role, fix it

**Checkpoint**: Checker can find the scan page from the navbar in one click. Other roles see no change to their navbar.

---

## Phase 12: Polish & Cross-Cutting Concerns (Frontend)

- [ ] T038 [P] Write Vitest + Testing Library test in `frontend/features/checkin/components/__tests__/StatusBadge.test.tsx` — assert that each of the 7 statuses renders the expected Spanish label and color class. Use `@testing-library/react` `render` and match the badge text content
- [ ] T039 [P] Write Vitest + Testing Library test in `frontend/features/checkin/components/__tests__/ActionButtons.test.tsx` — mock the 3 mutation hooks to return idle state, render `<ActionButtons ticket={mockTicket} />` for 4 scenarios (one button per scenario), assert the correct button is present and the others are not. Also test the "no allowed actions" case (nothing rendered)
- [ ] T040 Run `cd frontend && pnpm lint && pnpm build` to confirm no TypeScript or ESLint errors after all frontend tasks are merged

---

## Dependencies & Execution Order

### Phase Dependencies

- **Backend Setup (Phase 1)**: No dependencies — can start immediately
- **Backend Foundational (Phase 2)**: Depends on Setup — BLOCKS all backend user stories
- **Backend US1 (Phase 3)**: Depends on Foundational — no story dependencies
- **Backend US2+US3 (Phase 4)**: Depends on Foundational + US1 (shares `checkin.repository` and `checkin.service`)
- **Backend Wire & Polish (Phase 5)**: Depends on US1 + US2 completion
- **Backend Documentation (Phase 6)**: Depends on all phases
- **Frontend Foundational (Phase 7)**: Depends on ALL backend phases (1–6) — needs the running `/internal/checkin/*` endpoints to exist
- **Frontend US1 (Phase 8)**: Depends on Frontend Foundational (Phase 7)
- **Frontend US2 (Phase 9)**: Depends on Frontend Foundational (Phase 7) — independently testable
- **Frontend US3 (Phase 10)**: Depends on Frontend US2 (mounts inside `<CheckinSection>`)
- **Frontend US4 (Phase 11)**: Depends on Frontend Foundational (Phase 7) only — independent of US2/US3
- **Frontend Polish (Phase 12)**: Depends on all frontend user stories

### User Story Dependencies

**Backend**
- **US1 (P1)**: Can start after Foundational — independent, no story dependencies
- **US2+US3 (P1+P2)**: Depends on `checkin.repository` and `checkin.service` skeleton from US1 — adds request/confirm/reject methods to existing files
- **US4 (P3)**: Covered within US2 (token expiry handling in middleware is part of confirmations module)

**Frontend**
- **US-FE1 (P1, page access)**: Can start after Frontend Foundational — only verification of existing guards
- **US-FE2 (P1, scan + display)**: Can start after Frontend Foundational — independent of US-FE3
- **US-FE3 (P1, action buttons)**: Depends on US-FE2 (buttons mount inside CheckinSection)
- **US-FE4 (P2, navbar)**: Can start after Frontend Foundational — fully independent of US-FE2/US-FE3

### Within Each User Story

**Backend (Phases 1–6)**: types + validators before services → repository before service → service before controller → controller before routes

**Frontend (Phases 7–12)**: schemas + api + queries before components → scanner + summary components before section → section before action buttons → action buttons before session hook extensions

### Parallel Opportunities

**Backend**
- T002, T003, T004 [P] — all independent file creations
- T011, T012, T013 [P] — confirmations module files can be created in parallel

**Frontend**
- T020, T021, T022, T023, T025 [P] — feature folder + 4 files can be created in parallel (T024 `pnpm install` must complete first)
- T027, T028, T029 [P] — scanner + summary card + status badge are independent files
- T032, T033 [P] — action buttons + pending overlay are independent files
- T035, T036 [P] — `isCheckerRole` helper + Navbar update are independent files
- T038, T039 [P] — component tests are independent files

---

## Parallel Example: US2 (Remote Confirmation)

```bash
# Launch parallel file creations:
Task: "Create confirmations.middleware.ts"
Task: "Create confirmations.validators.ts + confirmations.types.ts"
Task: "Create messaging.client.ts"

# Then sequential:
Task: "confirmations.service.ts (depends on types + middleware)"
Task: "confirmations.controller.ts (depends on service)"
Task: "confirmations.routes.ts (depends on controller)"
```

---

## Parallel Example: Frontend US2 (Scan + Display)

```bash
# Launch parallel component creations:
Task: "Create QrScanner.tsx"
Task: "Create TicketSummaryCard.tsx"
Task: "Create StatusBadge.tsx"

# Then sequential:
Task: "useCheckinSession.ts (depends on useScanTicket from queries + components)"
Task: "CheckinSection.tsx (depends on session + components)"
```

---

## Implementation Strategy

### MVP First (Backend US1 + Frontend US2)

1. Complete Phases 1–2 (Backend Setup + Foundational)
2. Complete Phase 3 (Backend US1 — Direct entry)
3. **Backend MVP**: Test scan → confirm-entry → used flow
4. Complete Phases 4–6 (Backend US2/US3, wire, docs)
5. Complete Phase 7 (Frontend Foundational)
6. Complete Phase 9 (Frontend US2 — Scan + Display)
7. **Frontend MVP**: Test scan → ticket summary shown
8. Deploy/demo if ready

### Incremental Delivery

1. Backend Setup + Foundational → Foundation ready
2. Backend US1 (Direct entry) → Test independently → Deploy/Demo (Backend MVP)
3. Backend US2+US3 (Remote confirm/reject) → Test full flow → Deploy/Demo
4. Frontend Foundational → Feature folder wired
5. Frontend US2 (Scan + Display) → Test independently → Deploy/Demo (Frontend MVP — read-only)
6. Frontend US3 (Action buttons) → Test end-to-end → Deploy/Demo
7. Frontend US1 (Role guard verify) and US4 (Navbar) → Polish
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers (after all 6 backend phases done):

1. Team completes Phase 7 (Frontend Foundational) together — file creations are parallel
2. Developer A: Frontend US2 (Phase 9) — scanner + summary + section
3. Developer B: Frontend US4 (Phase 11) — Navbar checker button (independent of US2)
4. Developer A continues to US3 (Phase 10) after US2
5. Developer C: Frontend US1 (Phase 8) — verify guards (small task, can run in parallel)
6. Final: Phase 12 (tests + lint/build)

---

## Phase 13: Foundational (Client-Side Confirmation) — Blocking All Client-Confirm Stories

**Purpose**: Backend endpoint + frontend API client + tanstack hooks for the client to confirm/reject their own pending tickets from the dashboard. Reuses the existing `checkin.repository.confirmTicket` / `rejectConfirmation` transitions so no new state machine.

> **Scope note**: this phase covers the **in-app** confirmation path. The existing `pay`/`email`/`whatsapp` confirmation UI for the link-based flow is out of scope (already implemented in spec 017 via the `confirmations` module's `/confirm` + `/reject` routes; `pay` is the integrated MercadoPago webhook; email/WhatsApp link rendering is a `messaging` module concern not built yet).

- [x] T041 [P] Add `POST /api/me/tickets/:id/confirm` and `POST /api/me/tickets/:id/reject` routes to `backend/src/modules/me/me.routes.ts` (after the existing `meRouter.get('/tickets/:id', ...)` line). Use `me.controller.confirmMyTicketHandler` and `me.controller.rejectMyTicketHandler` controllers. Both are protected by the existing `meRouter.use(authMiddleware)`.
- [x] T042 Add `confirmMyTicket(ticketId, userId)` and `rejectMyTicket(ticketId, userId)` to `backend/src/modules/me/me.service.ts` — load the ticket by id, assert `ticket.buyerId === userId` else throw `NotFoundError` (don't leak existence to other users), assert `ticket.status === 'pending_confirmation'` else throw `ConflictError('Ticket is no longer pending confirmation')`, then call `checkinRepo.confirmTicket(ticketId)` / `checkinRepo.rejectConfirmation(ticketId)` and return `{ success: true, result: 'confirmed' | 'rejected' }`. Log the action with `userId` + `ticketId`.
- [x] T043 Add `confirmMyTicketHandler` and `rejectMyTicketHandler` controllers to `backend/src/modules/me/me.controller.ts` — parse `:id` from `req.params`, call the service with `req.user!.id`, catch `NotFoundError` → 404, `ConflictError` → 409, anything else → next. Return `res.json({ success: true, result })`.
- [x] T044 [P] Add `confirmMyTicket(id)` and `rejectMyTicket(id)` to `frontend/features/users/api/tickets.client.ts` using the existing `apiFetch` helper: `POST /api/me/tickets/${id}/confirm` and `POST /api/me/tickets/${id}/reject`. Both return `Promise<{ success: true; result: 'confirmed' | 'rejected' }>`.
- [x] T045 [P] Add `useConfirmMyTicket()` and `useRejectMyTicket()` mutation hooks to `frontend/features/users/hooks/useMyTickets.ts` (file rename is OK if the existing single hook expands). Use `useMutation` from TanStack. Each `onSuccess` calls `queryClient.invalidateQueries({ queryKey: ['my-tickets'] })` so the list re-fetches with the new status.
- [x] T046 Extend `frontend/features/users/schemas/ticket.schema.ts` with `confirmTicketResponseSchema` (parses `{ success: true, result: 'confirmed' | 'rejected' }`) and export the inferred type. Use it in the client to validate the response.

**Checkpoint**: backend endpoint works (curl with session token), frontend API client + hooks importable, types parse cleanly.

---

## Phase 14: User Story 1 — Confirm ticket from client UI (Priority: P1) 🎯

**Goal**: A buyer viewing their tickets list in `/mi-cuenta/entradas` can see a dropdown menu on each ticket in `pending_confirmation` status with two options: "Confirmar ingreso" and "Rechazar ingreso". Clicking either calls the new endpoint and refreshes the list.

**Why this priority**: This is the requested flow — the buyer is already in their account and wants to authorize the entry without going to email/WhatsApp. Eliminates a click round-trip.

**Independent Test**: Log in as a buyer with a ticket in `pending_confirmation` status. Open `/mi-cuenta/entradas`. The card shows a "..." button. Click it → dropdown opens with two options. Click "Confirmar ingreso" → spinner → success toast → card status changes to "Confirmada" (status re-fetched). For a different ticket, click "Rechazar ingreso" → spinner → toast → status changes to "Pagada". For a ticket in any other status, the dropdown button is not shown.

### Implementation for User Story 1

- [x] T047 [P] [US1] Create `frontend/features/users/components/TicketActionsMenu.tsx` (client component) — props: `ticket: TicketItem`, `onConfirm: (id: string) => void`, `onReject: (id: string) => void`. Uses Chakra `<Menu>` (root, trigger, listbox, item) with `IconDots` as the trigger icon. Two `<MenuItem>`s: "Confirmar ingreso" (brand-cyan icon) and "Rechazar ingreso" (red icon). Only render the menu when `ticket.status === 'pending_confirmation'` (otherwise return `null`). Wrap each click in `onClick` that calls the prop callback.
- [x] T048 [P] [US1] Create `frontend/features/users/components/ConfirmTicketDialog.tsx` (client component) — props: `open: boolean`, `mode: 'confirm' | 'reject'`, `ticket: TicketItem`, `onClose: () => void`, `onConfirm: () => void`, `onReject: () => void`. Chakra `<Dialog>` with brand-cyan border (confirm) or red border (reject). Title: "Confirmar ingreso" / "Rechazar ingreso". Body: copy explaining the consequence ("Vas a autorizar el ingreso del portador del QR" / "El portador del QR no podrá ingresar; el ticket volverá a estado Pagado"). Footer: "Cancelar" outline button + primary button "Confirmar" (cyan) or "Rechazar" (red). The primary button is disabled while `useConfirmMyTicket().isPending` / `useRejectMyTicket().isPending` and shows a `Spinner`. On success, calls the relevant prop and closes the dialog.
- [x] T049 [US1] Extend `frontend/features/users/components/TicketCard.tsx` to render the new actions. Add a "..." menu button at the top-right of the card (next to the status badge) when `status === 'pending_confirmation'`. Add state for the dialog: `dialogMode: 'confirm' | 'reject' | null`. Click a menu item → opens the dialog with that mode. Render `<ConfirmTicketDialog>` when `dialogMode` is set. Use `useConfirmMyTicket` / `useRejectMyTicket` and invalidate `['my-tickets']` on success. Show `sonner` toast: "Ingreso confirmado" / "Ingreso rechazado" on success; `sonner.error` with backend `code` mapping on failure (`TICKET_NOT_AVAILABLE` → "El ticket ya cambió de estado", `NOT_FOUND` → "Ticket no encontrado", `UNAUTHORIZED` → "Sesión expirada").
- [x] T050 [US1] Add error handling for stale `pending_confirmation` state in `TicketCard.tsx`: if the optimistic check fails (e.g., another device already confirmed), the toast informs the checker and the list re-fetches so the card UI reflects reality.

**Checkpoint**: Full confirm/reject flow works end-to-end from the buyer dashboard. Cards in other statuses have no menu.

---

## Phase 15: Polish & Cross-Cutting Concerns (Client-Side Confirmation)

- [x] T051 [P] Verify `pnpm tsc --noEmit -p tsconfig.json` and `pnpm lint` pass for the new files (backend `me.service.ts` + `me.controller.ts` + `me.routes.ts`; frontend `TicketActionsMenu.tsx` + `ConfirmTicketDialog.tsx` + `TicketCard.tsx` + `tickets.client.ts` + `useMyTickets.ts`).
- [x] T052 [P] Add Vitest + Testing Library test in `frontend/features/users/components/__tests__/TicketActionsMenu.test.tsx` — mock the callbacks, assert menu only renders for `pending_confirmation` tickets, assert both menu items fire the correct callback.

---

## Summary

| Metric | Count |
|--------|-------|
| Total tasks | 52 |
| Backend Setup (Phase 1) | 2 |
| Backend Foundational (Phase 2) | 2 |
| Backend US1 — Direct entry (Phase 3) | 4 |
| Backend US2 — Remote confirmation (Phase 4) | 8 |
| Backend Wire & Polish (Phase 5) | 2 |
| Backend Documentation (Phase 6) | 1 |
| Frontend Foundational (Phase 7) | 6 |
| Frontend US1 — Page access (Phase 8) | 1 |
| Frontend US2 — Scan + Display (Phase 9) | 5 |
| Frontend US3 — Action buttons (Phase 10) | 3 |
| Frontend US4 — Navbar (Phase 11) | 3 |
| Frontend Polish (Phase 12) | 3 |
| Client-Confirm Foundational (Phase 13) | 6 |
| Client-Confirm US1 — Confirm from UI (Phase 14) | 4 |
| Client-Confirm Polish (Phase 15) | 2 |
| Parallel tasks ([P]) | 22 |
| Test tasks | 4 (1 backend + 3 frontend) |
| Backend MVP scope | Phase 3 (4 tasks) |
| Frontend MVP scope | Phase 9 (5 tasks, read-only) |
| Client-Confirm MVP scope | Phase 14 (4 tasks) |

**Independent test criteria**:

**Backend**
- **US1**: Scan `paid` ticket → confirm-entry → 200 → rescan → `used` with timestamp
- **US2+US3**: Scan `paid` → request-confirmation → `pending_confirmation` → buyer confirms via token → `confirmed` → rescan → allow-entry → `used`; or buyer rejects → `paid`
- **Race condition**: Two concurrent confirm-entry on same ticket → one 200, one 409

**Frontend**
- **US1 (page access)**: `checker` reaches `/admin/checkin`; `client` is redirected to `/`
- **US2 (scan + display)**: Mobile camera scans a valid QR → ticket summary card appears within 2s with status badge + cedula; invalid QR shows toast; used ticket shows "Ya usado" with no actions
- **US3 (action buttons)**: Three flows from US2 test each render the right button and reset the session on success
- **US4 (navbar)**: `checker` sees "Check-in" + "Mi cuenta"; `client` sees "Mi cuenta" only; `admin` sees "Admin" + "Mi cuenta" (no "Check-in")
