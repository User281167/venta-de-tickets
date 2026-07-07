# Tasks: Payment System

**Input**: Design documents from `specs/009-payment-system/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks grouped by user story enabling independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story this task belongs to (US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project initialization needed — project exists. Proceed to Foundational.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: DB schema migration and core type definitions. Blocks all user stories.

**⚠ CRITICAL**: No user story work can begin until this phase is complete.

### Prisma Schema & Migration (014a)

- [X] T001 Add `PaymentStatus` enum (`pending`, `completed`, `failed`) to `backend/prisma/schema.prisma`
- [X] T002 Add `Payment` model to `backend/prisma/schema.prisma` per data-model.md (fields: id, userId, eventId, provider, providerTxId?, amountCents (Int), status, metadata (Json?), createdAt, updatedAt; relations: user, event, tickets[])
- [X] T003 Add `paymentId String? @map("payment_id") @db.Uuid` + `payment Payment? @relation(...)` to existing `Ticket` model in `backend/prisma/schema.prisma`
- [X] T004 [P] [US1] Add `tickets Ticket[]` relation to new `Payment` model in `backend/prisma/schema.prisma`
- [X] T005 Run `npx prisma validate` to confirm schema is valid
- [X] T006 Run `npx prisma migrate dev --name add_payments` to generate migration; verify `payments` table + `PaymentStatus` enum + `tickets.payment_id` column created
- [X] T007 Add `PAYMENT_PROVIDER`, `FRONTEND_URL`, `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET` to Zod schema in `backend/src/shared/config/env.ts` (PAYMENT_PROVIDER: enum mercadopago, default mercadopago; FRONTEND_URL: string url; MERCADOPAGO_ACCESS_TOKEN: string min 1; MERCADOPAGO_WEBHOOK_SECRET: string min 1)
- [X] T008 Add all four env vars to `backend/.env` with placeholder values
- [X] T009 [P] Create `backend/src/modules/payments/payments.types.ts` — define `PaymentProvider` interface (createCheckout, verifySignature, parseWebhook), `CheckoutInput`, `CheckoutResult`, `NormalizedWebhookEvent`, and `PaymentStatus` TS type matching Prisma enum
- [X] T010 Create `backend/src/modules/payments/payments.repository.ts` — implement `create({ userId, eventId, provider, amountCents })`, `update(id, { status?, providerTxId?, metadata? })`, `findByReference(reference)`, `findByIdWithTickets(id)`
- [X] T011 Create `backend/src/modules/payments/providers/provider.registry.ts` — implement `registerProvider(name, provider)` + `getProvider(name): PaymentProvider` using `Map<string, PaymentProvider>`; auto-register providers on module load; throw if name not found

**Checkpoint**: Foundation ready — DB has `payments` table, types and repository exist, provider registry can accept implementations.

---

## Phase 3: User Story 1+2 — Backend Checkout + Webhook (Priority: P1) 🎯 MVP

**Goal**: Complete checkout flow: reserve tickets → create payment → call MP → receive webhook → confirm tickets. Both US1 and US2 share the same backend implementation.

**Independent Test**: Use MP sandbox: POST /checkout returns checkout URL; complete payment in sandbox; webhook fires; DB shows payment `completed`, tickets `confirmed`.

### Mercado Pago Provider (014c)

- [X] T012 Run `npm install mercadopago` in `backend/`
- [X] T013 Create `backend/src/modules/payments/providers/mercadopago.provider.ts` implementing `PaymentProvider` — initialize MP client with `MERCADOPAGO_ACCESS_TOKEN` from env
- [X] T014 [P] [US1] Implement `createCheckout(input)` in `mercadopago.provider.ts` — build MP Preference object (items, external_reference = payment.id, back_urls → FRONTEND_URL/mi-cuenta/tiquetes?payment={id}, auto_return: 'approved', notification_url: API_URL/api/payments/webhook, payer.email); call `Preference.create()`; return `{ checkoutUrl: preference.init_point, externalId: preference.id }`
- [X] T015 [P] [US1] Implement `verifySignature(payload, headers)` in `mercadopago.provider.ts` — extract `x-signature` header, reconstruct HMAC-SHA256 with `MERCADOPAGO_WEBHOOK_SECRET`, return boolean
- [X] T016 [P] [US1] Implement `parseWebhook(payload)` in `mercadopago.provider.ts` — handle `{ type: 'payment', data: { id } }`, fetch full MP payment details, map status (approved→'approved', rejected/cancelled→'declined', else→'pending'), return `NormalizedWebhookEvent`
- [X] T017 [US1] Register `MercadoPagoProvider` in `provider.registry.ts`
- [X] T018 [P] [US1] Unit test: mock MP SDK, verify `createCheckout` builds correct Preference shape in `test/mercadopago.provider.test.ts`
- [X] T019 [P] [US1] Unit test: `parseWebhook` maps MP statuses correctly
- [X] T020 [P] [US1] Unit test: `verifySignature` accepts valid HMAC, rejects tampered payload

### Service, Controller & Routes (014d)

- [ ] T021 [P] [US1] Create `backend/src/modules/payments/payments.validators.ts` — Zod `checkoutSchema`: `{ ticket_type_id: z.string().uuid(), quantity: z.number().int().min(1).max(4) }`
- [ ] T022 Create `backend/src/modules/payments/payments.service.ts` — implement `checkout(userId, input)`:
  - Fetch ticketType (price, eventId, name) + user (email)
  - Compute `amountCents = ticketType.price * quantity * 100`
  - **Zone 1** (DB transaction): call `reserveAtomic` (module 012), call `paymentsRepository.create`, call `tickets.setPaymentId`
  - **Zone 2** (after commit): resolve provider via `getProvider(env.PAYMENT_PROVIDER)`, call `provider.createCheckout({ reference: payment.id, amountCents, ... })`, call `paymentsRepository.update` with providerTxId
  - Return `{ checkout_url, payment_id, reserve_expires_at }`
- [ ] T023 [P] [US1] Implement `handleWebhookEvent(event: NormalizedWebhookEvent)` in `payments.service.ts`:
  - Find payment by `event.reference`
  - Idempotency: if status already `completed` or `failed` → return early
  - `approved` → update payment to `completed` + call `tickets.confirmByPaymentId`
  - `declined` → update payment to `failed` + call `tickets.cancelByPaymentId`
  - Store `rawPayload` in payment.metadata
- [ ] T024 Add to `backend/src/modules/ticket-types/ticket-types.repository.ts` — `setPaymentId(ticketIds: string[], paymentId: string)`, `confirmByPaymentId(paymentId: string)`, `cancelByPaymentId(paymentId: string)`
- [ ] T025 Create `backend/src/modules/payments/payments.webhook.ts` — implement `handleWebhook(req, res)`:
  - Resolve provider (env default)
  - Call `provider.verifySignature(body, headers)` → `400` if false
  - `event = provider.parseWebhook(body)`
  - Call `paymentsService.handleWebhookEvent(event)`
  - Return `200`
- [ ] T026 Create `backend/src/modules/payments/payments.controller.ts` — `checkout` action wrapping `paymentsService.checkout`, `getPaymentStatus` wrapping `paymentsRepository.findByIdWithTickets`
- [ ] T027 Create `backend/src/modules/payments/payments.routes.ts` — `POST /checkout` behind `authMiddleware` → controller.checkout; `POST /webhook` public → paymentsWebhook.handleWebhook; `GET /:id` behind `authMiddleware` + ownership check → controller.getPaymentStatus
- [ ] T028 Wire payments routes in `backend/src/app.ts` — `app.use('/api/payments', paymentsRouter)`
- [ ] T029 [P] [US1] Vitest: checkout service — mock repo + provider, assert Zone 1 commits before Zone 2 in `backend/src/modules/payments/__tests__/payments.service.test.ts`
- [ ] T030 [P] [US2] Vitest: `handleWebhookEvent` — idempotency (already completed → no-op), approved maps correct ticket/payment states
- [ ] T031 Manual QA: POST /checkout via Postman with real MP test credentials → get MP checkout URL back

**Checkpoint**: Backend complete — POST /checkout returns MP URL, POST /webhook processes payment updates. MVP backend is testable via Postman + MP sandbox.

---

## Phase 4: User Story 1 — Frontend Checkout (Priority: P1) 🎯 MVP

**Goal**: Users click "Comprar" on event page, get redirected to MP, then see ticket confirmation upon return.

**Independent Test**: Click "Comprar" on event page with selected tickets → redirects to MP sandbox → complete payment → returns to app → shows "Tus boletas están listas".

### Data Layer (014e)

- [ ] T032 [P] [US1] Create `frontend/src/features/payments/schemas/payments.schema.ts` — Zod `checkoutSchema` mirroring backend (ticket_type_id: uuid, quantity: int 1–4)
- [ ] T033 [P] [US1] Create `frontend/src/features/payments/api/payments.endpoints.ts` — `POST /api/payments/checkout` via `apiFetch`
- [ ] T034 [P] [US1] Create `frontend/src/features/payments/api/payments.queries.ts` — `useCheckout` mutation: on success set `window.location.href = data.checkout_url`; on 409 show inventory error + invalidate useTicketTypes; on other error show inline error

### Checkout Button

- [ ] T035 [US1] Create `frontend/src/features/payments/components/CheckoutButton.tsx` — receives `ticketTypeId` + `quantity` props; calls `useCheckout` mutation on click; shows loading state; disables during request
- [ ] T036 [US1] Wire `CheckoutButton` into event page: `TicketSelector` confirm action triggers `CheckoutButton` in `frontend/src/features/events/components/TicketSection.tsx` or equivalent

### Post-Payment Page

- [ ] T037 [US1] Create `frontend/src/app/mi-cuenta/tiquetes/page.tsx` — reads `?payment={id}` from URL (MP `back_urls` param); renders post-payment state component
- [ ] T038 [US1] Create `frontend/src/features/payments/components/PaymentResultPage.tsx` — polls `GET /api/payments/:id` every 3s via `usePaymentStatus(paymentId)` until status is `completed` or `failed` (max 30s then show "Verificando..."); shows completed ("Tus boletas están listas" + ticket list), failed ("El pago no fue procesado" + retry button), pending (spinner + "Verificando tu pago...") states

### QA

- [ ] T039 [US1] Manual: Click "Comprar" on event page → redirect to MP sandbox checkout
- [ ] T040 [US1] Manual: Complete payment in MP sandbox → webhook fires → return to app → verify "Tus boletas están listas" shows confirmed tickets
- [ ] T041 [US1] Manual: Cancel in MP sandbox → return to app → verify "El pago no fue procesado" shows
- [ ] T042 [US1] Manual: Two browsers buy last ticket simultaneously → one sees checkout URL, other sees "Cupos insuficientes"

**Checkpoint**: End-to-end checkout flow functional — user can buy tickets, pay via MP, and see confirmation.

---

## Phase 5: User Story 3 — Payment Failure Recovery (Priority: P2)

**Goal**: Tickets auto-release when provider call fails after DB commit.

**Independent Test**: Create reservation, simulate MP timeout, confirm tickets expire via existing cron after 10min TTL.

- [ ] T043 [P] [US2] Verify existing ticket expiry cron handles `reserved` tickets with expired `reserveExpiresAt` — no changes needed (existing cron covers FR-7)
- [ ] T044 [P] [US2] Manual: POST /checkout with invalid MP token (forced failure) → confirm payment stays `pending`, tickets still `reserved` with `reserveExpiresAt` set; wait for cron → tickets become `expired`
- [ ] T045 [P] [US1] Update checkout error response: if provider call fails, return 500 with `{ code: 'PAYMENT_PROVIDER_ERROR', message: 'Payment provider unavailable — tickets reserved, please retry' }`

**Checkpoint**: Failure scenarios handled — provider outage doesn't lock inventory.

---

## Phase 6: User Story 4 — Provider Extensibility (Priority: P3)

**Goal**: Adding a new provider requires only a provider file + registry entry.

**Independent Test**: Create mock provider implementing `PaymentProvider`, register it, switch `PAYMENT_PROVIDER` env var, verify flows still work.

- [ ] T046 [P] [US2] Add `api_url` to env.ts: `API_URL` (string, url) for MP `notification_url` in preference — used by provider for webhook URL
- [ ] T047 [P] [US2] Update `mercadopago.provider.ts` `createCheckout` to use `API_URL` env var for `notification_url` instead of hardcoded

**Checkpoint**: Extensibility path validated — new provider needs only a file + registration.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — skip (project exists)
- **Phase 2 (Foundational)**: No dependencies — start immediately
- **Phase 3 (US1+US2 Backend)**: Depends on Phase 2 completion
- **Phase 4 (US1 Frontend)**: Depends on Phase 3 completion (backend routes)
- **Phase 5 (US3 Failure Recovery)**: Can proceed after Phase 3 (uses existing cron)
- **Phase 6 (US4 Extensibility)**: Can proceed after Phase 3

### User Story Dependencies

- **US1 (P1) MVP**: Depends on 014a (DB), 014b (types/repo), 014c (provider), 014d (service/routes), 014e (frontend)
- **US2 (P1) MVP**: Depends on 014a (DB), 014b (types/repo), 014c (provider), 014d (webhook handler)
- **US3 (P2)**: Depends on 014d (service error handling + existing cron integration)
- **US4 (P3)**: Depends on 014b (registry pattern) + 014d (env usage)

### Within Each Phase

- Types before services
- Models/migrations before repositories
- Repositories before services
- Provider implementation before service orchestration
- Services before controllers/routes
- Backend complete before frontend integration
- Core implementation before integration/QA

### Parallel Opportunities

- T009, T010, T011 can run in parallel (014b — different files)
- T014, T015, T016 can run in parallel (014c — different methods on same file but can be authored independently then merged)
- T018, T019, T020 can run in parallel (014c — separate test files)
- T021 can run in parallel with T022-023 (validators vs service — different files)
- T032, T033, T034 can run in parallel (014e frontend — different files)
- T024 (ticket repository extensions) can overlap with T022 (service — different modules)
- T043, T044 can run during Phase 4 (no file conflicts with frontend work)

---

## Implementation Strategy

### MVP First (Phases 2+3+4)

1. Complete Phase 2: DB Migration + Types/Registry/Repository
2. Complete Phase 3: MP Provider + Service + Controller + Routes
3. Complete Phase 4: Frontend Checkout Button + Post-Payment Page
4. **STOP and VALIDATE**: Full end-to-end test with MP sandbox
5. Deploy MVP

### Incremental Delivery

1. Complete Phases 2+3 → Backend testable via Postman/curl (MVP backend)
2. Add Phase 4 → End-to-end checkout working (MVP full stack)
3. Add Phase 5 → Failure recovery verified
4. Add Phase 6 → Extensibility validated

### Parallel Team Strategy

With multiple developers:
1. Phase 2 (Foundational): Developer A (014a DB), Developer B (014b types/repo/registry)
2. Phase 3: Developer A (014c MP provider), Developer B (014d service + webhook)
3. Phase 4: Developer A (014e frontend — pages), Developer B (014e frontend — components)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to user story for traceability
- Each user story independently completable and testable
- Commit after each task or logical group
- Tests written first for T018-T020, T029-T030 (test-driven)
- Avoid: vague tasks, same-file conflicts, cross-story dependencies breaking independence
