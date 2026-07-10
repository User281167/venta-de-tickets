# Tasks: Payment Multi-Provider Architecture & Ticket QR Entrance

**Input**: Design documents from `specs/005-payment-ticket-entrance/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Required for new feature tasks.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5, US6)
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
- [x] T011 Create `backend/src/modules/payments/index.ts` — exports `paymentsRouter` from `payments.routes.js`.
- [x] T012 [P] Add `createCheckoutTransaction()` to `backend/src/modules/payments/payments.repository.ts` — Prisma `$transaction`: (1) sweep expired reserved tickets perezosamente, (2) `SELECT ... FOR UPDATE` on `ticket_types`, (3) validate enabled + stock, (4) `UPDATE quantity_sold`, (5) `INSERT tickets` (reserved, 15min expiry), (6) `INSERT payment` (pending). Returns `{ paymentId }`.
- [x] T013 [P] Add `processPaymentWebhook()` to `backend/src/modules/payments/payments.repository.ts` — Prisma `$transaction`: idempotent via `providerTxId`, updates Payment → `completed`, updates Tickets → `paid`. Returns `{ processed: boolean }`.
- [x] T014 [P] Add check-in functions to `backend/src/modules/checkin/checkin.repository.ts` — all Prisma `$transaction` + FOR UPDATE: checkInDirect, requestConfirmation, confirmTicket, rejectConfirmation, allowEntry. Each returns `CheckInResult` discriminated union.
- [x] T015 [P] Add `findByPendingConfirmationAndConfirmed()` to `backend/src/modules/checkin/checkin.repository.ts` — query para dashboard del checker.

---

## Phase 3: User Story 1 — Ticket Purchase & QR Delivery (Priority: P1) 🎯 MVP

**Goal**: Customer selects ticket types, complete checkout, system creates payment, Mercado Pago processes it, webhook confirms, system creates ticket with QR code.

**Independent Test**: POST to checkout endpoint, capture `paymentId`, simulate webhook with approved status, verify ticket exists with valid QR JWT in database.

- [x] T016 Update `contracts/api.md` checkout request to accept array of items: `{ items: [{ ticketTypeId, quantity }], backUrl: string }` instead of single `ticketTypeId` + `quantity`.
- [x] T017 [US1] Create `backend/src/modules/payments/payments.service.ts` — `createCheckout` (accepts providerName param, validates via registry), `processWebhook` (accepts providerName from URL param), `getPaymentStatus`, `checkIn`.
- [x] T018 [US1] Create `backend/src/modules/payments/payments.controller.ts` — `handleCheckout` (201), `handleWebhook` (200), `handleGetPaymentStatus` (200), `handleCheckIn` (200).
- [x] T019 [US1] Create `backend/src/modules/payments/payments.routes.ts` — `POST /api/checkout` (auth), `POST /api/payments/webhook/:provider` (public), `GET /api/payments/:id/status` (auth), `POST /api/internal/checkin` (auth + checker/admin role via `requireRole`).
- [x] T020 [P] [US1] Add `generateQrForTicket()` to `backend/src/modules/tickets/tickets.service.ts` — generates QR JWT `jwt.sign({ tid, iat }, env.QR_JWT_SECRET)`, stores via `ticketsRepo.updateQrToken()`. No user info in payload.
- [x] T021 [US1] Register payment routes in `backend/src/app.ts` — `app.use('/api', paymentsRouter)` and `app.use('/api', checkinRouter)`.
- [x] T022 [US1] Update Mercado Pago provider `createCheckout` if needed — no changes needed, `items` array support already correct.

---

## Phase 4: User Story 2 — QR Entry Check-in (Priority: P1)

**Goal**: Event staff scans QR, system validates JWT, atomically marks entry, prevents double check-in.

**Independent Test**: Submit valid QR JWT to check-in endpoint → success. Submit same QR again → 409 conflict.

- [x] T023 [US2] Create `backend/src/modules/checkin/checkin.service.ts` — `checkIn(qrToken, checkerId)`: verify JWT, call repo, map `CheckInResult` to error responses or success.
- [x] T024 [US2] Create `backend/src/modules/checkin/checkin.controller.ts` — `handleCheckIn`: extract checkerId from auth, call service, return 200/400/404/409.
- [x] T025 [US2] Create `backend/src/modules/checkin/checkin.routes.ts` — `POST /api/internal/checkin` (auth + checker/admin).
- [x] T026 [US2] Create `backend/src/modules/checkin/checkin.types.ts` — `CheckInResult` discriminated union type.
- [x] T027 [US2] Create `backend/src/modules/checkin/checkin.validators.ts` — Zod schema for `qrToken`.
- [x] T028 [US2] Create `backend/src/modules/checkin/index.ts` — export `checkinRouter`.
- [x] T029 [US2] Create `backend/src/modules/checkin/README.md` — route table, error codes, sequence diagrams.
- [x] T030 [US2] Create `backend/test/checkin/checkin.repository.test.ts` — 25 tests covering all branches of 6 repository functions.
- [x] T031 [US2] Create `backend/test/checkin/checkin.service.test.ts` — 10 tests covering JWT verify, each `CheckInResult` action, error codes 400/404/409.

---

## Phase 5: User Story 3 — Multi-Provider Architecture (Priority: P2)

**Goal**: Payment provider interface works for any provider, not just Mercado Pago. New providers plug in via registry.

**Independent Test**: Register a mock provider implementing the interface, create checkout through it, verify normalized webhook processing works identically.

- [x] T032 [US3] Review `PaymentProvider` interface in `payments.types.ts` — confirm no Mercado Pago-specific types leak into generic interfaces. No changes needed.
- [ ] T033 [US3] Add `stripe` and `paypal` as future provider references in `backend/src/modules/payments/providers/provider.registry.ts` — add comment stubs showing how to register them. No implementation required.
- [x] T034 [US3] Provider resolution per request — removed `PAYMENT_PROVIDER` env var. Client passes `provider` in checkout body. Webhook URL includes `:provider` segment. Service calls `getProvider(providerName)` to validate + route.

---

## Phase 6: User Story 4 — Client Ticket Listing (New)

**Goal**: Authenticated client users can list their own tickets and view individual ticket details. Ownership enforced at repository level.

**Independent Test**: Log in as client, GET `/api/me/tickets` returns only that user's tickets. GET `/api/me/tickets/:id` returns ticket if owned, 404 otherwise. Log in as another user, same ticket ID returns 404.

### Repository

- [x] T035 [P] [US4] Add `findByUserId(userId, page, limit)` to `backend/src/modules/tickets/tickets.repository.ts` — queries Ticket records where `userId` matches, paginated, ordered by `createdAt DESC`. Include `ticketType` relation (select `name`). Count variant `countByUserId(userId)`.
- [x] T036 [P] [US4] Add `findOwnedById(ticketId, userId)` to `backend/src/modules/tickets/tickets.repository.ts` — queries Ticket by `id` AND `userId`. Returns null if not found or not owned. Include `ticketType` relation.

### Service

- [x] T037 [US4] Add `listMyTickets(userId, page, limit)` to `backend/src/modules/tickets/tickets.service.ts` — calls `findByUserId` + `countByUserId`, returns `{ data, total, page, limit }`.
- [x] T038 [US4] Add `getMyTicketById(ticketId, userId)` to `backend/src/modules/tickets/tickets.service.ts` — calls `findOwnedById`. Throws `NotFoundError` if null (unified — ticket not found OR not owned, same error).

### Controller & Routes

- [x] T039 [P] [US4] Add `listMyTicketsHandler` and `getMyTicketByIdHandler` to `backend/src/modules/me/me.controller.ts` — wrap service calls with standard error handling (ZodError → 422, others throw). Use local pagination schema.
- [x] T040 [P] [US4] Add routes to `backend/src/modules/me/me.routes.ts` — `GET /tickets` (auth, requireRole('client')), `GET /tickets/:id` (auth, requireRole('client')).

### Tests

- [x] T041 [P] [US4] Create `backend/test/tickets/tickets.repository.client.test.ts` — tests for `findByUserId`, `countByUserId`, `findOwnedById` (found + owned, found + not owned, not found).
- [x] T042 [US4] Add `listMyTickets` and `getMyTicketById` tests in `backend/test/tickets/tickets.service.test.ts` — mock repository, verify ownership enforcement, verify NotFoundError when not owned.

---

## Phase 7: User Story 5 — Admin Sales Management (New)

**Goal**: Admin can view all payments (sales) with pagination ordered by date, and inspect individual payment details with associated tickets.

**Independent Test**: Log in as admin, GET `/api/admin/payments` returns paginated payment list ordered by date DESC. GET `/api/admin/payments/:id` returns payment with tickets. Non-admin gets 403.

### Repository

- [x] T043 [P] [US5] Add `findAllPayments(page, limit)` to `backend/src/modules/payments/payments.repository.ts` — queries all Payments, paginated, ordered by `createdAt DESC`. Include `user` relation (select `id`, `email`, `fullName`). Count variant `countAllPayments()`.
- [x] T044 [P] [US5] Add `findPaymentByIdWithUser(id)` to `backend/src/modules/payments/payments.repository.ts` — queries Payment by `id`, include `user` relation and `tickets` (with `ticketType` relation for name).

### Service

- [x] T045 [US5] Add `listPayments(page, limit)` to `backend/src/modules/admins/admins.service.ts` (or new `payments.admin.service.ts`) — calls `findAllPayments` + `countAllPayments`, returns `{ data, total, page, limit }`.
- [x] T046 [US5] Add `getPaymentDetail(paymentId)` to admin service — calls `findPaymentByIdWithUser`. Throws `NotFoundError` if null.

### Controller & Routes

- [x] T047 [P] [US5] Add `listPaymentsHandler` and `getPaymentDetailHandler` to `backend/src/modules/admins/admins.controller.ts` — wrap service calls with Zod validation, standard error handling.
- [x] T048 [P] [US5] Add routes to `backend/src/modules/admins/admins.routes.ts` — `GET /payments` (auth, admin, requireRole('admin')), `GET /payments/:id` (auth, admin, requireRole('admin')).

### Tests

- [x] T049 [P] [US5] Create `backend/test/payments/payments.repository.admin.test.ts` — tests for `findAllPayments` (pagination, ordering), `findPaymentByIdWithUser` (found, not found).
- [x] T050 [US5] Create `backend/test/admins/admins.sales.test.ts` — integration tests: list payments with pagination, get payment detail, non-admin gets 403.

---

## Phase 8: User Story 6 — Admin Manual Sale Creation (New)

**Goal**: Admin can directly assign tickets to users without going through payment provider. One-step: admin provides userId + ticketTypeId + quantity, system validates stock + user existence, creates Ticket records with status `paid`, generates QR codes and ticket codes. No Payment row created.

**Independent Test**: Log in as admin, POST `/api/admin/sales` with valid userId + ticketTypeId + quantity. Verify tickets created with `paid` status, qrToken set, ticketCode set, ticketType quantitySold increased. Verify invalid userId returns 404, insufficient stock returns 409.

### Repository

- [x] T051 [US6] Add `createAdminSale(input)` to `backend/src/modules/tickets/tickets.repository.ts` — Prisma `$transaction`: (1) `SELECT ... FOR UPDATE` on `ticket_types`, (2) validate exists + enabled + stock, (3) `UPDATE quantity_sold`, (4) `INSERT tickets` (status `paid`, `purchasedAt = now()`, `qrToken` null initially, `ticketCode` generated). Returns array of ticket IDs.

### Service

- [x] T052 [US6] Add `checkUserExists(userId)` to `backend/src/modules/admins/admins.service.ts` or `users.service.ts` — simple Prisma query to check user exists by ID.
- [x] T053 [US6] Add `createAdminSale(userId, ticketTypeId, quantity)` to `backend/src/modules/admins/admins.service.ts` — (1) validate ticket type exists + enabled + stock via `ticketsService.getTicketTypeById()`, (2) validate user exists via `checkUserExists()`, (3) call `ticketsRepo.createAdminSale()`, (4) for each created ticket, call `ticketsService.generateQrForTicket()`. Return created tickets.

### Validator

- [x] T054 [P] [US6] Add `adminSaleSchema` to `backend/src/modules/admins/admins.validators.ts` — `{ userId: uuid, ticketTypeId: uuid, quantity: int >= 1 }`.

### Controller & Routes

- [x] T055 [P] [US6] Add `createSaleHandler` to `backend/src/modules/admins/admins.controller.ts` — validate body with `adminSaleSchema`, call admin service, return 201.
- [x] T056 [P] [US6] Add route to `backend/src/modules/admins/admins.routes.ts` — `POST /sales` (auth, adminMiddleware, requireRole('admin')).

### Tests

- [x] T057 [P] [US6] Create `backend/test/tickets/tickets.repository.admin-sale.test.ts` — tests for `createAdminSale`: success happy path, insufficient stock, ticket type not found, ticket type disabled, concurrent stock race.
- [x] T058 [US6] Add tests in `backend/test/admins/admins.sales.test.ts` — integration test: create sale with valid data returns 201, invalid user returns 404, insufficient stock returns 409, non-admin returns 403, verify tickets created with correct data (status `paid`, qrToken set, ticketCode set, quantitySold incremented).

---

## Phase 9: Tests for Existing Flows

**Purpose**: Backfill tests for payment service flows not yet covered.

- [ ] T059 Create `backend/test/payments/payments.service.test.ts` — Vitest tests for:
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
- [ ] T060 Run all tests in `backend/test/` to verify nothing is broken: `cd backend && npx vitest run`

---

## Phase 10: Polish & Cleanup

**Purpose**: Documentation, constitution amendment, final cleanup.

- [ ] T061 Clear dead code — remove any orphaned payment test files or unused imports found in T005. Check `backend/src/modules/payments/` for any leftover files no longer needed.
- [ ] T062 [P] Create `backend/src/modules/payments/README.md` — follow format of `backend/src/modules/tickets/README.md`:
  - Route table (method, path, description, auth) for all payment endpoints
  - Error codes with HTTP status and cause
  - Business rules (checkout validation, webhook idempotency, QR format, check-in atomicity)
  - Mermaid sequence diagrams for: checkout flow, webhook processing, QR check-in
  - Provider architecture explanation (interface + registry pattern)
- [ ] T063 [P] Update `.specify/memory/constitution.md` — amend line 83: change `Payments: Wompi` to `Payments: Mercado Pago`. Add amendment rationale note referencing this feature (cost/scale/technical constraint: existing codebase already targets Mercado Pago, preferred for Colombia market compliance).
- [ ] T064 Run final test suite: `cd backend && npx vitest run` — all tests pass.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — review only
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 1 + 2 completion
- **US2 (Phase 4)**: Depends on Phase 1 + 2 + US1 completion (needs QR generation from US1)
- **US3 (Phase 5)**: Depends on Phase 1 + 2 + US1 completion (needs service + webhook from US1)
- **US4 (Phase 6)**: Depends on Phase 1 + 2 + Foundational (no hard dependency on US1-3 but uses same Ticket model)
- **US5 (Phase 7)**: Depends on Phase 1 + 2 + Foundational (no hard dependency on US1-3 but uses Payment model)
- **US6 (Phase 8)**: Depends on Phase 1 + 2 + Foundational + US1 (needs `generateQrForTicket` from US1) + US5 (Payment model familiarity)
- **Tests (Phase 9)**: Depends on Phase 1-3 completion
- **Polish (Phase 10)**: Depends on all prior phases

### User Story Dependencies

- **US1 (P1) 🎯 MVP**: Can start after Foundational — No dependencies on other stories
- **US2 (P1)**: Depends on US1 (needs QR token to check in against)
- **US3 (P2)**: Depends on US1 (needs webhook processing in place)
- **US4 (P1)**: Independent of US1-3 — needs only Ticket model which exists after Phase 2 ⚡
- **US5 (P1)**: Independent of US1-3 — needs only Payment model which exists after Phase 2 ⚡
- **US6 (P2)**: Depends on US1 (needs `generateQrForTicket`), US5 (Payment concepts)

### Parallel Opportunities

- US4 + US5 + US1 can run in parallel after Phase 2 (all use different endpoints/models)
- US6 depends on US1 (QR generation) but can start in parallel after US4/US5
- All [P] marked tasks within a phase can run in parallel
- T059 (payment service tests) is independent of US4-6

---

## Parallel Example: User Story 4

```bash
# Launch all repository + service work for US4:
Task: "findByUserId + findOwnedById in tickets.repository.ts"
Task: "listMyTickets + getMyTicketById in tickets.service.ts"
Task: "Handler functions in me.controller.ts"
Task: "Routes in me.routes.ts"
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
3. Add US2 (Check-in) + US3 (Multi-provider) → Test → Deploy
4. Add US4 (Client tickets) + US5 (Admin sales) → Test → Deploy
5. Add US6 (Admin sale creation) → Test → Deploy
6. Phase 9 (Tests) + Phase 10 (Polish) → Complete

### Quick Wins (US4 + US5 first after MVP)

Both US4 and US5 are:
- Read-only after Phase 2 (no new DB schema changes)
- No dependencies on US1-US3
- Easy to test independently
- High value (clients see tickets, admins see sales)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- QR token payload contains ONLY `tid` (ticket UUID) and `iat` (timestamp) — NO user info
- Use `env.ts` for config, never `process.env` or `process` directly
- No auto-migrations — existing Prisma schema is sufficient
- Use existing `TicketStatus` enum: `paid` = confirmed purchase, `used` = checked in
- US6: No Payment row created — tickets are assigned directly with status `paid`
- All ticket ownership enforcement happens at repository level (findOwnedById checks both id AND userId)
