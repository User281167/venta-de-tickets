# Tasks: Payment Multi-Provider Architecture & Ticket QR Entrance

**Input**: Design documents from `specs/005-payment-ticket-entrance/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Required — user explicitly requested endpoint testing.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `backend/src/`
- Tests: `backend/test/`

---

## Phase 1: Setup — Review & Audit Existing Code

**Purpose**: Audit current payment module, verify against Mercado Pago docs, identify dead code.

- [x] T001 [P] Review payment core interface in `backend/src/modules/payments/payments.types.ts` — verified `PaymentProvider` is provider-agnostic. No Mercado Pago specifics in generic types. Findings: ready for multi-provider.
- [x] T002 [P] Review `backend/src/modules/payments/payments.repository.ts` — identified `eventId` bug: `create()` passed non-existent `eventId` field. Fixed in T007.
- [x] T003 [P] Review `backend/src/modules/payments/providers/mercadopago.provider.ts` — verified against `docs/mercadopago/*.md`. Preference creation, back_urls, webhook validation, and parsing all correctly implemented per Checkout Pro docs.
- [x] T004 [P] Review `backend/src/modules/payments/providers/provider.registry.ts` — works for multi-provider. Register, get, list all functional.
- [x] T005 Check `backend/src/app.ts` — no dead payment routes. No unused imports found. Zero orphaned payment code.
- [x] T006 [P] Check `backend/test/` — 3 existing payment test files found: `mercadopago.provider.test.ts`, `payments.provider-registry.test.ts`, `payments.repository.test.ts`. All reference existing code.

---

## Phase 2: Foundational — Schema, Repo & Validators

**Purpose**: Update Prisma schema (new TicketStatus enum), add atomic checkout/check-in repository functions, validators.

- [x] T007 [P] Fix `eventId` bug in `backend/src/modules/payments/payments.repository.ts` — removed `eventId` from `create()` params and Prisma data.
- [x] T008 [P] Add `findByProviderTxId()` to `backend/src/modules/payments/payments.repository.ts` — queries `Payment` by `providerTxId` using `findFirst`.
- [x] T009 [P] Update `backend/prisma/schema.prisma` — replace `TicketStatus` enum: remove `active`, add `paid` + `pending_confirmation`. Add `confirmation_requested_at` field to Ticket model.
- [x] T010 [P] Create `backend/src/modules/payments/payments.validators.ts` — Zod schemas: `checkoutItemSchema`, `checkoutSchema` (items array + backUrl), `checkinSchema` (qrToken), `paymentStatusParamsSchema` (uuid id).
- [x] T011 Create `backend/src/modules/payments/index.ts` — empty placeholder (routes created in Phase 3).
- [x] T012 [P] Add `createCheckoutTransaction()` to `backend/src/modules/payments/payments.repository.ts` — Prisma `$transaction`: (1) sweep expired reserved tickets perezosamente, (2) `SELECT ... FOR UPDATE` on `ticket_types`, (3) validate enabled + stock, (4) `UPDATE quantity_sold`, (5) `INSERT tickets` (reserved, 15min expiry), (6) `INSERT payment` (pending). Returns `{ paymentId }`.
- [x] T013 [P] Add `processPaymentWebhook()` to `backend/src/modules/payments/payments.repository.ts` — Prisma `$transaction`: idempotent via `providerTxId`, updates Payment → `completed`, updates Tickets → `paid`. Returns `{ processed: boolean }`.
- [x] T014 [P] Add check-in functions to `backend/src/modules/payments/payments.repository.ts` — all Prisma `$transaction` + FOR UPDATE:
  - `checkInDirect(ticketId, checkerId)` — paid → used (titular coincide)
  - `requestConfirmation(ticketId, checkerId)` — paid → pending_confirmation (titular NO coincide)
  - `confirmTicket(ticketId)` — pending_confirmation → confirmed (comprador autoriza)
  - `rejectConfirmation(ticketId)` — pending_confirmation → paid (rechazo o timeout)
  - `allowEntry(ticketId, checkerId)` — confirmed → used (staff permite ingreso)
  - Each returns `CheckInResult` discriminated union type.
- [x] T015 [P] Add `findByPendingConfirmationAndConfirmed()` to `backend/src/modules/payments/payments.repository.ts` — query para dashboard del checker: tickets en `pending_confirmation` o `confirmed`, ordenados por `confirmation_requested_at ASC`.

---

## Phase 3: User Story 1 — Ticket Purchase & QR Delivery (Priority: P1) 🎯 MVP

**Goal**: Customer selects ticket types, complete checkout, system creates payment, Mercado Pago processes it, webhook confirms, system creates ticket with QR code.

**Independent Test**: POST to checkout endpoint, capture `paymentId`, simulate webhook with approved status, verify ticket exists with valid QR JWT in database.

- [x] T012 Update `contracts/api.md` checkout request to accept array of items: `{ items: [{ ticketTypeId, quantity }], backUrl: string }` instead of single `ticketTypeId` + `quantity`.
- [x] T013 [US1] Create `backend/src/modules/payments/payments.service.ts` — `createCheckout` (accepts providerName param, validates via registry), `processWebhook` (accepts providerName from URL param), `getPaymentStatus`, `checkIn`.
- [x] T014 [US1] Create `backend/src/modules/payments/payments.controller.ts` — `handleCheckout` (201), `handleWebhook` (200), `handleGetPaymentStatus` (200), `handleCheckIn` (200).
- [x] T015 [US1] Create `backend/src/modules/payments/payments.routes.ts` — `POST /api/checkout` (auth), `POST /api/payments/webhook/:provider` (public), `GET /api/payments/:id/status` (auth), `POST /api/internal/checkin` (auth + checker/admin role via `requireRole`).
- [x] T016 [P] [US1] Add `generateQrForTicket()` to `backend/src/modules/tickets/tickets.service.ts` — generates QR JWT `jwt.sign({ tid, iat }, env.QR_JWT_SECRET)`, stores via `ticketsRepo.updateQrToken()`. No user info in payload.
- [x] T017 [US1] Register payment routes in `backend/src/app.ts` — `app.use('/api', paymentsRouter)` and `app.use('/api', internalRouter)`.
- [x] T018 [US1] Update Mercado Pago provider `createCheckout` if needed — no changes needed, `items` array support already correct.

---

## Phase 4: User Story 2 — QR Entry Check-in (Priority: P1)

**Goal**: Event staff scans QR, system validates JWT, atomically marks entry, prevents double check-in.

**Independent Test**: Submit valid QR JWT to check-in endpoint → success. Submit same QR again → 409 conflict.

- [ ] T019 [US2] Add `checkIn()` method to `backend/src/modules/payments/payments.service.ts`:
  - Verify JWT signature using `jwt.verify(qrToken, env.QR_JWT_SECRET)` — reject with 400 if invalid (no DB query).
  - Extract `tid` from decoded payload.
  - Call repository `updateWithAtomicCheckIn(ticketId, checkerId)` — FOR UPDATE pattern.
  - Return ticket data on success, 409 if already used/wrong status.
- [ ] T020 [US2] Add check-in handler to `backend/src/modules/payments/payments.controller.ts` — `handleCheckIn`: extract checkerId from auth token, call service.checkIn, return 200 with ticket data.
- [ ] T021 [US2] Add check-in route to `backend/src/modules/payments/payments.routes.ts` — `POST /api/internal/checkin` — requires auth + `checker` or `admin` role.

---

## Phase 5: User Story 3 — Multi-Provider Architecture (Priority: P2)

**Goal**: Payment provider interface works for any provider, not just Mercado Pago. New providers plug in via registry.

**Independent Test**: Register a mock provider implementing the interface, create checkout through it, verify normalized webhook processing works identically.

- [ ] T022 [US3] Review `PaymentProvider` interface in `payments.types.ts` — confirm no Mercado Pago-specific types leak into generic interfaces. If any exist, refactor to extract provider-specific types into the provider subfolder.
- [ ] T023 [US3] Add `stripe` and `paypal` as future provider references in `provider.registry.ts` — add comment stubs showing how to register them. No implementation required.
- [x] T024 [US3] Provider resolution per request — removed `PAYMENT_PROVIDER` env var. Client passes `provider` in checkout body. Webhook URL includes `:provider` segment. Service calls `getProvider(providerName)` to validate + route.

---

## Phase 6: Tests

**Purpose**: Verify all endpoints and business logic.

- [ ] T025 Create `backend/test/payments.service.test.ts` — Vitest tests for:
  - `createCheckout` with valid items → creates Payment, calls provider, returns checkout URL
  - `createCheckout` with disabled ticket type → throws ValidationError
  - `createCheckout` exceeding `maxPerUser` → throws ValidationError
  - `createCheckout` exceeding `quantityTotal` → throws ValidationError
  - `createCheckout` with multiple ticket types in single request
  - `processWebhook` with approved status → updates Payment to completed, creates tickets with QR
  - `processWebhook` with declined status → updates Payment to failed, no tickets
  - `processWebhook` duplicate notification → idempotent, skips processing
  - `processWebhook` invalid signature → rejects with error
  - `getPaymentStatus` returns payment + tickets with qrToken
- [ ] T026 Create `backend/test/check-in.test.ts` — Vitest tests for:
  - Valid QR JWT → check-in succeeds, status changes to `used`, `checkedInAt` set
  - Invalid JWT (tampered signature) → 400, no DB query
  - Expired JWT → 400
  - Already checked in ticket → 409
  - Ticket in `cancelled` status → 409
  - Concurrent check-in (two simultaneous calls) → only one succeeds (verified via Promise.all)
- [ ] T027 Update `backend/test/payments.repository.test.ts` — add tests for `findByProviderTxId` and `updateWithAtomicCheckIn`.
- [ ] T028 [P] Run all tests in `backend/test/` to verify nothing is broken: `cd backend && npx vitest run`

---

## Phase 7: Polish & Cleanup

**Purpose**: Dead code removal, documentation, constitution amendment.

- [ ] T029 Clear dead code — remove any orphaned payment test files or unused imports found in T005. Check `backend/src/modules/payments/` for any leftover files no longer needed.
- [ ] T030 [P] Create `backend/src/modules/payments/README.md` — follow format of `backend/src/modules/tickets/README.md`:
  - Route table (method, path, description, auth) for all payment endpoints
  - Error codes with HTTP status and cause
  - Business rules (checkout validation, webhook idempotency, QR format, check-in atomicity)
  - Mermaid sequence diagrams for: checkout flow, webhook processing, QR check-in
  - Provider architecture explanation (interface + registry pattern)
- [ ] T031 [P] Update `.specify/memory/constitution.md` — amend line 83: change `Payments: Wompi` to `Payments: Mercado Pago`. Add amendment rationale note referencing this feature (cost/scale/technical constraint: existing codebase already targets Mercado Pago, preferred for Colombia market compliance).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — review only
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 1 + 2 completion
- **US2 (Phase 4)**: Depends on Phase 1 + 2 + US1 completion (needs QR generation from US1)
- **US3 (Phase 5)**: Depends on Phase 1 + 2 + US1 completion (needs service + webhook from US1)
- **Tests (Phase 6)**: Depends on Phases 1-5 completion
- **Polish (Phase 7)**: Depends on all prior phases

### User Story Dependencies

- **US1 (P1) 🎯 MVP**: Can start after Foundational — No dependencies on other stories
- **US2 (P1)**: Depends on US1 (needs QR token to check in against)
- **US3 (P2)**: Depends on US1 (needs webhook processing in place)

### Within Each User Story

- Validators/schemas before service
- Service before controller/routes
- Core implementation before test tasks

### Parallel Opportunities

- Phase 1: T001-T006 all marked [P] — can run in parallel (review only)
- Phase 2: T007-T010 marked [P] — repository methods and validators independent
- Phase 3: T016 marked [P] — adding `createTicketForPurchase` to tickets service is independent of payments service work
- Phase 7: T030-T031 marked [P] — README and constitution amendment are independent

---

## Parallel Example: User Story 1

```bash
# Launch service + route registration in parallel:
Task: "Create payments.service.ts"
Task: "Create payments.controller.ts"
Task: "Create payments.routes.ts"
Task: "Add createTicketForPurchase to tickets.service.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup — audit existing code
2. Complete Phase 2: Foundational — fix bugs, add validators
3. Complete Phase 3: US1 — Purchase flow with QR generation
4. **STOP and VALIDATE**: Test purchase flow independently
5. Deploy/demo if ready (can create payments and tickets)

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. Add US1 (Purchase + QR) → Test → Deploy (MVP!)
3. Add US2 (Check-in) → Test → Deploy
4. Add US3 (Multi-provider) → Test → Deploy
5. Phase 6 (Tests) + Phase 7 (Polish) → Complete

### Parallel Team Strategy

With multiple developers:
1. Start Phase 1 in parallel (all review tasks independent)
2. Phase 2: Repository fixes in parallel
3. Phase 3: Service + controller in parallel
4. Phase 6: Tests after all implementation done

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- QR token payload contains ONLY `tid` (ticket UUID) and `iat` (timestamp) — NO user info
- Use `env.ts` for config, never `process.env` or `process` directly
- No auto-migrations — existing Prisma schema is sufficient
- Use existing `TicketStatus` enum: `active` = paid, `used` = checked in
