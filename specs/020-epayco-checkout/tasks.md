# Tasks: ePayco Checkout Provider

**Input**: Design documents from `specs/020-epayco-checkout/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

**Tests**: Not requested — skip test tasks.

**Organization**: Tasks grouped by phase. Backend first, then frontend. Mercado Pago must remain untouched.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths

---

## Phase 1: Setup (Configuration & Env)

**Purpose**: Environment variables, docs review, scaffolding

- [X] T001 Read docs/epayco/ to understand ePayco API flow: Apify login, session creation, webhook signature (SHA256), Smart Checkout frontend
- [X] T002 [P] Add ePayco env vars to backend/.env.example: EPAYCO_PUBLIC_KEY, EPAYCO_PRIVATE_KEY, EPAYCO_P_KEY, EPAYCO_CUST_ID_CLIENTE
- [X] T003 [P] Add ePayco env vars + validation to backend/src/shared/config/env.ts using Zod

---

## Phase 2: Foundational (Backend Core)

**Purpose**: Apify auth service and ePayco provider implementation — blocks all user stories.

- [X] T004 Create ApifyAuthService in backend/src/modules/payments/providers/epayco/apify-auth.service.ts: login() calls POST https://apify.epayco.co/login with Basic auth (PUBLIC_KEY:PRIVATE_KEY base64), caches Bearer token with expiry, getToken() returns cached or refreshes automatically
- [X] T005 [P] Create EpaycoProvider implementing PaymentProvider in backend/src/modules/payments/providers/epayco.provider.ts: getProviderName() returns "epayco"
- [X] T006 [P] [US1] Implement EpaycoProvider.createCheckout(): calls ApifyAuthService.getToken(), then POST https://apify.epayco.co/payment/session/create with checkout_version "2", name, currency "COP", amount (totalCents/100), response URL, confirmation URL, billing.email; returns { sessionId, checkoutUrl, providerTxId }
- [X] T007 [P] [US2] Implement EpaycoProvider.verifySignature(): compute SHA256(p_cust_id_cliente^p_key^x_ref_payco^x_transaction_id^x_amount^x_currency_code) and compare to x_signature
- [X] T008 [P] [US2] Implement EpaycoProvider.parseWebhook(): extract x_extra1 → reference (paymentId), map x_response ("Aceptada"→approved, "Rechazada"/"Fallida"→declined, "Pendiente"→pending), x_transaction_id → externalId
- [X] T009 Register EpaycoProvider in backend/src/modules/payments/providers/provider.registry.ts

---

## Phase 3: User Story 1 — Purchase Tickets with ePayco (Priority: P1) 🎯 MVP

**Goal**: Customer selects ePayco at checkout, backend creates session, frontend renders onpage widget, payment completes.

**Independent Test**: Create checkout with `provider: "epayco"` via POST /api/payments/checkout, verify response contains `sessionId`, verify payment record with `provider: "epayco"` in DB.

### Backend

- [X] T010 [P] [US1] Extend existing POST /api/payments/checkout response: return `sessionId` field alongside existing `checkoutUrl`/`preferenceId` when provider is "epayco"
- [X] T011 [US1] Create GET /api/payments/epayco/status/:paymentId polling endpoint: queries ePayco validation API to confirm final transaction status
- [X] T012 [US1] Add Zod schema for provider field in backend/src/modules/payments/payments.validators.ts: accept "epayco" in addition to "mercadopago"

### Frontend

- [X] T013 [P] [US1] Create frontend/features/payments/types/epayco.ts: ePayco-specific TypeScript types (EpaycoCheckoutResponse, EpaycoWebhookPayload, etc.)
- [X] T014 [P] [US1] Create frontend/features/payments/api/epayco.ts: createEpaycoSession() calls POST /api/payments/checkout with provider "epayco", pollEpaycoStatus() calls GET /api/payments/epayco/status/:paymentId
- [X] T015 [P] [US1] Create frontend/features/payments/api/epayco.queries.ts: useCreateEpaycoCheckout() TanStack Query mutation, useEpaycoStatus() polling query
- [X] T016 [US1] Create EpaycoCheckoutButton component in frontend/features/payments/components/EpaycoCheckoutButton.tsx: dynamically loads https://checkout.epayco.co/checkout-v2.js, on click calls createEpaycoSession, then configures ePayco.checkout.configure({sessionId, type: "onpage", test: true/false}), registers hooks (onResponse, onClosed, onErrors), calls checkout.open()
- [X] T017 [US1] Modify frontend/features/ticket-purchase/api/checkout.api.ts: extend CheckoutResponse type with optional sessionId field, add provider parameter to createCheckoutPreference()
- [X] T018 [US1] Modify frontend/features/ticket-purchase/components/CheckoutPageClient.tsx: add ePayco as payment provider option alongside Mercado Pago, render EpaycoCheckoutButton when ePayco selected, show provider selector UI
- [X] T019 [US1] Handle onResponse hook in EpaycoCheckoutButton: redirect user to /checkout/state on successful payment
- [X] T020 [US1] Handle onErrors and onClosed hooks in EpaycoCheckoutButton: show error message, re-enable button, allow retry

**Checkpoint**: User can select ePayco, see Smart Checkout widget, complete payment end-to-end.

---

## Phase 4: User Story 2 — ePayco Webhook Processing (Priority: P1)

**Goal**: Backend receives and processes ePayco payment notifications to update payment statuses and create tickets.

**Independent Test**: Send simulated ePayco webhook POST to /api/payments/webhook/epayco with valid signature, verify payment status updates correctly.

### Backend

- [X] T021 [US2] Handle ePayco webhook content-type: added express.urlencoded({ extended: true }) middleware — ePayco sends form-encoded
- [X] T022 [US2] Wire existing /api/payments/webhook/:provider route: already wired via generic route + provider registry — no changes needed

**Checkpoint**: ePayco webhook received, signature verified, payment status updated, tickets created — same as Mercado Pago flow.

---

## Phase 5: User Story 3 — Checkout Provider Selection (Priority: P2)

**Goal**: Users can visibly choose between Mercado Pago and ePayco during checkout with clear provider labels.

**Independent Test**: Observe two provider options at checkout, select each, verify correct provider flow.

- [X] T023 [P] [US3] Add provider radio/toggle UI in frontend/features/ticket-purchase/components/CheckoutPageClient.tsx: "Mercado Pago" and "ePayco" options with logos — done in T018
- [X] T024 [P] [US3] Pass selected provider to createCheckoutPreference() API call — done in T017/T018
- [X] T025 [US3] Update payment display in frontend/features/users/components/PaymentRow.tsx and PaymentDetail.tsx: show "ePayco" label for provider="epayco" payments

**Checkpoint**: Both provider options visible, selection routes to correct provider flow, payments display correct provider name.

---

## Phase 6: Response Page & Polish

**Purpose**: Handle return/state pages after payment completes.

- [ ] T026 Modify or create checkout state pages in frontend/app/(public)/checkout/state/: handle ePayco return after Smart Checkout (poll GET /api/payments/epayco/status/:paymentId while webhook processes)
- [ ] T027 Verify Mercado Pago flow is unbroken: run existing Mercado Pago tests, check that provider="mercadopago" still works identically
- [ ] T028 Run lint and typecheck across changed files: backend (tsc), frontend (tsc —noEmit)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start first
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 (needs EpaycoProvider + ApifyAuthService)
- **US2 (Phase 4)**: Depends on Phase 2 (needs EpaycoProvider.verifySignature + parseWebhook). Can run in parallel with US1
- **US3 (Phase 5)**: Depends on Phase 3 frontend tasks (needs CheckoutPageClient modifications)
- **Polish (Phase 6)**: Depends on Phase 3 completion

### User Story Dependencies

- **US1 (P1)**: Backend + Frontend — needs provider + session creation + widget
- **US2 (P1)**: Backend only — needs webhook handling. Independent of US1
- **US3 (P2)**: Frontend only — needs provider selector UI. Depends on US1 frontend

### Parallel Opportunities

- T002 and T003 can run in parallel (different files)
- T004 and T005 can run in parallel (ApifyAuthService vs provider skeleton)
- T006 (US1 createCheckout) and T007/T008 (US2 webhook) can run in parallel
- T013, T014, T015, T016 (frontend) can all run in parallel after backend T010 is done
- T023, T024, T025 (US3 frontend) depend on T018 being complete

---

## Implementation Strategy

### MVP (US1 + US2)

1. Phase 1: Setup env vars
2. Phase 2: ApifyAuthService + EpaycoProvider
3. Phase 3: Backend checkout endpoint extension + frontend widget
4. Phase 4: Webhook processing (can parallel with Phase 3)
5. **STOP and VALIDATE**: Complete ePayco purchase + webhook flow

### Incremental Delivery

1. Backend: provider implementation + endpoint → test via curl
2. Frontend: widget integration → test manual
3. Webhook: signature verification + status mapping → test via simulated payload
4. Provider selector: add UI → test both providers

### What Must NOT Break

- Mercado Pago `createCheckout()` — unchanged logic
- Mercado Pago webhook route `POST /api/payments/webhook/mercadopago` — unchanged
- Existing `CheckoutResponse` shape — `sessionId` is optional, backward compatible
- Existing checkout page — MP button still works when MP selected

## Notes

- ePayco amount is in COP decimal (totalCents / 100), not cents
- Webhook payload may be form-encoded (not JSON) — handle both content types
- `type: "onpage"` renders widget on same page; `test: true` for sandbox
- Signature is SHA256 (not MD5)
