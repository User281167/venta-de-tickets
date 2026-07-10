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

- [ ] T001 [P] Review payment core interface in `backend/src/modules/payments/payments.types.ts` — verify `PaymentProvider` methods (`getProviderName`, `createCheckout`, `verifySignature`, `parseWebhook`) are provider-agnostic with no Mercado Pago specifics. Check `CheckoutInput`, `CheckoutResult`, `NormalizedWebhookEvent` types. Document findings.
- [ ] T002 [P] Review `backend/src/modules/payments/payments.repository.ts` — identify `eventId` bug: `create()` passes `eventId` field that doesn't exist on Prisma `Payment` model. Note exact fix needed (remove `eventId` from params and Prisma data).
- [ ] T003 [P] Review `backend/src/modules/payments/providers/mercadopago.provider.ts` — verify implementation against `docs/mercadopago/*.md` steps: preference creation, back_urls config, webhook signature validation, webhook parsing. Note any gaps vs official Mercado Pago Checkout Pro docs.
- [ ] T004 [P] Review `backend/src/modules/payments/providers/provider.registry.ts` — verify registration, lookup, and listing work for multi-provider support.
- [ ] T005 Check `backend/src/app.ts` for any dead/orphan payment route registrations or unused imports across the codebase (`backend/src/modules/payments/`, `backend/src/modules/tickets/`).
- [ ] T006 [P] Check `backend/test/` for existing payment test files: `mercadopago.provider.test.ts`, `payments.provider-registry.test.ts`, `payments.repository.test.ts` — verify they still pass after changes.

---

## Phase 2: Foundational — Fix Core, Add Types & Validators

**Purpose**: Fix bugs in existing code, add required schemas and validators before user story work.

- [ ] T007 [P] Fix `eventId` bug in `backend/src/modules/payments/payments.repository.ts` — remove `eventId` from `create()` function parameters and from Prisma `data` object. Update `create()` signature to: `(input: { userId: string; provider: string; amountCents: number })`.
- [ ] T008 [P] Add `findByProviderTxId()` to `backend/src/modules/payments/payments.repository.ts` — query `Payment` by `providerTxId` field for webhook idempotency check.
- [ ] T009 [P] Add `updateWithAtomicCheckIn()` to `backend/src/modules/payments/payments.repository.ts` — Prisma interactive transaction with `SELECT ... FOR UPDATE` on ticket row, verify status `active`, update to `used` with `checkedInAt` and `checkedInBy`. Return updated ticket or null.
- [ ] T010 [P] Create `backend/src/modules/payments/payments.validators.ts` — Zod schemas for:
  - `checkoutSchema`: array of `{ ticketTypeId: uuid, quantity: positiveInt }` + `backUrl: url`
  - `webhookSchema`: raw JSON (validated by provider)
  - `checkinSchema`: `{ qrToken: string }`
  - `paymentStatusParams`: `{ id: uuid }`
- [ ] T011 Create `backend/src/modules/payments/index.ts` — export `initPaymentsModule(app)` function that registers all payment routes on Express app.

---

## Phase 3: User Story 1 — Ticket Purchase & QR Delivery (Priority: P1) 🎯 MVP

**Goal**: Customer selects ticket types, complete checkout, system creates payment, Mercado Pago processes it, webhook confirms, system creates ticket with QR code.

**Independent Test**: POST to checkout endpoint, capture `paymentId`, simulate webhook with approved status, verify ticket exists with valid QR JWT in database.

- [ ] T012 Update `contracts/api.md` checkout request to accept array of items: `{ items: [{ ticketTypeId, quantity }], backUrl: string }` instead of single `ticketTypeId` + `quantity`.
- [ ] T013 [US1] Create `backend/src/modules/payments/payments.service.ts` — implement:
  - `createCheckout(userId, items, backUrl)`: validate each item's ticket type (enabled, quantityTotal >= quantitySold + requested), sum amountCents, create Payment (pending), call `provider.createCheckout()`, return `{ paymentId, checkoutUrl }`.
  - `processWebhook(payload, headers)`: detect provider, verify signature via `provider.verifySignature()`, parse via `provider.parseWebhook()`, check idempotency via `findByProviderTxId()`, if approved update Payment to `completed` and call ticket service to create tickets with QR, if declined update Payment to `failed`.
  - `getPaymentStatus(paymentId, userId)`: return payment + related tickets with qrToken.
- [ ] T014 [US1] Create `backend/src/modules/payments/payments.controller.ts` — Express handlers:
  - `handleCheckout`: extract userId from auth, call service.createCheckout, return 201 with `{ paymentId, checkoutUrl }`.
  - `handleWebhook`: extract raw body + headers, call service.processWebhook, return 200 `{ received: true }`.
  - `handleGetPaymentStatus`: extract userId, call service.getPaymentStatus, return 200 with payment + tickets.
- [ ] T015 [US1] Create `backend/src/modules/payments/payments.routes.ts` — wire controller to Express router:
  - `POST /api/checkout` — requires auth (authenticated user)
  - `POST /api/payments/webhook` — public (provider calls it)
  - `GET /api/payments/:id/status` — requires auth (owner or admin)
- [ ] T016 [P] [US1] Add `createTicketForPurchase()` to `backend/src/modules/tickets/tickets.service.ts` — method that accepts `(paymentId, userId, items: Array<{ticketTypeId, quantity}>)`, creates Ticket records with status `active`, generates unique `ticketCode`, generates QR JWT `jwt.sign({ tid: ticket.id, iat: Date.now() }, env.QR_JWT_SECRET)`, stores `qrToken` on each ticket. No user info in QR payload.
- [ ] T017 [US1] Register payment routes in `backend/src/app.ts` — import and call `initPaymentsModule(app)` after existing route registrations.
- [ ] T018 [US1] Update Mercado Pago provider `createCheckout` if needed — ensure `items` array handles multiple ticket types correctly (already tested in existing tests).

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
- [ ] T024 [US3] Ensure provider resolution in webhook handler is configurable — currently hardcoded `mercadopago`. Add `PAYMENT_PROVIDER` env var lookup to select active provider from registry. Default: `mercadopago`.

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
