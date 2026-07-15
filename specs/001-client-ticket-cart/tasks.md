---

description: "Task list for Mercado Pago checkout integration"
---

# Tasks: Mercado Pago Checkout Integration

**Feature**: Client-Side Ticket Cart (iteration 2 — checkout + payment gateway)

**Input**: spec.md, plan.md, docs/mercadopago/*.md, backend modules/payments/

**Prerequisites**: All Phase 1-7 tasks completed (cart context, localStorage persistence, CartDrawer with auth check, 42 tests passing)

## Architecture Notes

- **Backend checkout endpoint**: `POST /api/payments/checkout` (auth required) — accepts `{ items: [{ticketTypeId, quantity}], backUrl, provider }` — returns `{ paymentId, checkoutUrl, preferenceId }`
- **Backend webhook**: `POST /api/payments/webhook/:provider` — already fully implemented in `mercadopago.provider.ts` with signature validation, status normalization, and payment processing
- **Frontend SDK**: `@mercadopago/sdk-react@1.0.7` already installed in `frontend/package.json`
- **Existing cart types**: `CartItem` has `ticketTypeId`, `quantity`, `unitPriceCents`, `name` — maps directly to backend checkout items
- **Backend `providerTxId`** = Mercado Pago `preferenceId` — returned as `preferenceId` in checkout response
- **Payment flow**: User clicks "Pagar con Mercado Pago" → frontend calls `POST /api/payments/checkout` with `provider: "mercadopago"` → backend returns `preferenceId` → frontend renders `<Wallet initialization={{ preferenceId }} />` → user clicks official MP button → redirected to MP hosted checkout
- **No auto-creation**: Payment preference is NEVER created automatically on page mount. User must explicitly select a provider.
- **Future providers**: Architecture supports adding PayPal etc. by adding new provider implementations + buttons in CheckoutPageClient

---

## Phase 1: Setup & Integration Review

**Purpose**: Configure env vars, review backend compatibility, plan integration surface

- [X] T001 Add `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` to `frontend/.env.local.example` (user said: env files are gitignored; only example file needed for setup reference)
- [X] T002 Review backend checkout response — confirm `createCheckout` in `payments.service.ts` returns `preferenceId` (alias for `providerTxId` from `mercadopago.provider.ts`); if missing, add it alongside `paymentId` / `checkoutUrl`
- [X] T003 Create Mercado Pago initialization module at `frontend/features/ticket-purchase/lib/initMercadoPago.ts` — calls `initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY)` once, exports ready flag

---

## Phase 2: Foundational

**Purpose**: Backend response update + frontend API helper — blocks all user stories

- [X] T004 Modify `payments.service.ts:createCheckout` return to include `preferenceId: checkoutResult.providerTxId` in response — frontend Wallet Brick needs this
- [X] T005 Create checkout API helper at `frontend/features/ticket-purchase/api/checkout.api.ts` — `createCheckoutPreference(items: CheckoutItem[], backUrl: string)` calls `POST /api/payments/checkout`, returns `{ paymentId, checkoutUrl, preferenceId }`; uses Supabase session token for auth
- [X] T006 Update CartDrawer `handleBuy` in `frontend/features/ticket-purchase/components/CartDrawer.tsx` — replace `toast.info` + redirect with `router.push("/checkout")` (auth redirect to `/login?redirect=/checkout` if no user); removed unused `sonner` import; updated tests accordingly

**Checkpoint**: Cart → /checkout navigation works. Backend returns preferenceId.

---

## Phase 3: User Story 1 — Checkout Review Page (Priority: P1)

**Goal**: Full-page checkout review showing cart items and order summary. Payment provider selection handled in separate phase (see Phase 7).

**Independent Test**: Load `/checkout` with items in cart → items list + OrderSummary render. Empty cart → redirects to `/entradas`.

### Tests for User Story 1

- [X] T007 [P] [US1] Test `checkout.api.ts` — mock fetch, verify correct body (`items`, `backUrl`, `provider`) sent to backend, verify response parsed (5 tests)
- [X] T008 [P] [US1] Test CheckoutPage rendering — mock `useCart` with items, assert items list + OrderSummary rendered; mock empty cart, assert redirect (2 tests)
- [X] T009 [P] [US1] Create `CheckoutPageClient` component at `frontend/features/ticket-purchase/components/CheckoutPageClient.tsx` — reads cart via `useCart()`, renders items list (left) + `OrderSummary` with `hideComprar` (right, sticky sidebar); handles empty cart (redirect to `/entradas`)
- [X] T010 [P] [US1] Create `MpWalletButton` component at `frontend/features/ticket-purchase/components/MpWalletButton.tsx` — wraps `<Wallet initialization={{ preferenceId }} />` from `@mercadopago/sdk-react`; receives `preferenceId` as prop; shows loading skeleton while preference is being created
- [X] T011 [US1] Create checkout page route at `frontend/app/(public)/checkout/page.tsx` — imports and renders `CheckoutPageClient`
- [X] T012 [US1] Wire checkout navigation: CartDrawer "Comprar" redirects to `/checkout`; checkout page does NOT auto-create payment preference (user must click provider button in Phase 7)

**Checkpoint**: User can navigate cart → /checkout → see items + summary. No payment API called.

---

## Phase 4: User Story 2 — Redirect / Status Pages (Priority: P2)

**Goal**: Handle Mercado Pago `back_urls` redirects — show appropriate success/failure/pending status to user after MP payment flow.

**Independent Test**: Navigate to `/checkout/success?collection_status=approved&payment_id=123&external_reference=abc` → shows success with payment ID. Navigate to `/checkout/failure?collection_status=rejected` → shows failure message.

### Tests for User Story 2

- [X] T013 [P] [US2] Test `CheckoutSuccessPage` — mock query params with `collection_status=approved&payment_id=123`, assert success message + payment ID rendered
- [X] T014 [P] [US2] Test `CheckoutFailurePage` — renders failure message with retry link
- [X] T015 [P] [US2] Test `CheckoutPendingPage` — renders pending message with instructions

### Implementation for User Story 2

- [X] T016 [P] [US2] Create success page at `frontend/app/(public)/checkout/success/page.tsx` — reads query params (`collection_status`, `payment_id`, `external_reference`), shows "Pago exitoso" + payment ID + "Volver a entradas" link; clears cart on mount via `clearCart()`
- [X] T017 [P] [US2] Create failure page at `frontend/app/(public)/checkout/failure/page.tsx` — reads query params, shows "Pago rechazado" + reason (from `collection_status`) + "Intentar de nuevo" link back to `/entradas`; cart preserved
- [X] T018 [P] [US2] Create pending page at `frontend/app/(public)/checkout/pending/page.tsx` — shows "Pago pendiente" + "Recibirás confirmación por correo" + instructions for cash/offline payments
- [X] T019 [US2] Add a route group layout at `frontend/app/(public)/checkout/layout.tsx` — minimal layout (no Navbar CartFab to avoid confusion), shared `title` logic

**Checkpoint**: All three redirect routes render with correct status info. Cart clears on success.

---

## Phase 5: User Story 3 — Webhook Verification & End-to-End Tests (Priority: P3)

**Goal**: Verify backend webhook correctly processes MP notifications. Write mock-based E2E test covering full flow.

**Independent Test**: Mock MP webhook POST → backend processes → payment status updated. Mock frontend flow: CartDrawer → checkout → MP redirect → success page → cart cleared.

### Tests for User Story 3

- [X] T020 [US3] Write webhook integration test — mock `paymentClient.get` returning approved status, POST to `/api/payments/webhook/mercadopago`, assert payment updated + tickets created
- [X] T021 [US3] Write full flow integration test (mock-based): add items to cart → navigate to checkout → "createPreference" mock returns preferenceId → Wallet button renders → mock MP redirect to success → cart cleared
- [X] T022 [US3] Verify `notification_url` in `mercadopago.provider.ts` points to correct public URL (`env.API_URL + "/api/payments/webhook"`) — no mismatch

**Checkpoint**: Webhook processes payments end-to-end. Frontend flow works with mocks.

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Error handling, loading states, visual polish

- [X] T023 Add loading skeleton state to `MpWalletButton` while preference is being created — show shimmer placeholder matching Wallet button dimensions
- [X] T024 Remove auto-mutation from `CheckoutPageClient` — checkout page no longer creates payment preference on mount; only shows items + summary
- [X] T025 Update all checkout tests to match new flow — remove auto-mutation/wallet tests, keep basic render + redirect tests (195 total pass)
- [X] T026 Verify `/entradas` page still works end-to-end: ticket types load, add/remove, CartDrawer opens, Comprar navigates to /checkout

---

## Phase 7: User Story 4 — Explicit Payment Provider Selection (Priority: P1)

**Goal**: User clicks "Pagar con Mercado Pago" button → frontend calls API with `provider: "mercadopago"` → backend returns `preferenceId` → Wallet renders → user redirected to MP.

**Why explicit**: Payment preference must NEVER be created on page mount. User always chooses provider. This enables future providers (PayPal, etc.) with same pattern.

**Independent Test**: Load `/checkout` with items → click "Pagar con Mercado Pago" → Wallet button renders → click MP Wallet → redirected to MP checkout.

### Tests for User Story 4

- [X] T027 [P] [US4] Test "Pagar con Mercado Pago" button renders in `CheckoutPageClient` when cart has items in `frontend/features/ticket-purchase/components/__tests__/CheckoutPageClient.test.tsx`
- [X] T028 [P] [US4] Test click handler triggers `createCheckoutPreference` with correct items and `provider: "mercadopago"` in `frontend/features/ticket-purchase/components/__tests__/checkout-flow.test.tsx`
- [X] T029 [P] [US4] Test `MpWalletButton` renders after `preferenceId` received in response in `frontend/features/ticket-purchase/components/__tests__/checkout-flow.test.tsx`
- [X] T030 [US4] Test error state when `createCheckoutPreference` fails — show error message + retry button in `frontend/features/ticket-purchase/components/__tests__/checkout-flow.test.tsx`

### Implementation for User Story 4

- [X] T031 [P] [US4] Add "Pagar con Mercado Pago" button to `CheckoutPageClient` below `OrderSummary` in `frontend/features/ticket-purchase/components/CheckoutPageClient.tsx` — button disabled while loading, calls `createCheckoutPreference(items, backUrl)` on click
- [X] T032 [P] [US4] Add `preferenceId` state to `CheckoutPageClient` — when preferenceId is set, hide the "Pagar con Mercado Pago" button and show `MpWalletButton` with the received `preferenceId` prop
- [X] T033 [US4] Add loading state to "Pagar con Mercado Pago" button — show spinner while `createCheckoutPreference` is in flight, disable button to prevent double-click
- [X] T034 [US4] Add error handling to `CheckoutPageClient` — if preference creation fails, show error message + "Reintentar" button that retries `createCheckoutPreference`; replace old error UI (was removed in T024)
- [X] T035 [US4] Verify `backUrl` in `checkout.queries.ts` uses `${window.location.origin}/checkout/success` — confirmed at `frontend/features/ticket-purchase/api/checkout.queries.ts:12-14`

### Backend verification

- [X] T036 [US4] Verify `payments.service.ts:createCheckout` returns `preferenceId` in response — confirmed at `backend/src/modules/payments/payments.service.ts:126` (`preferenceId: checkoutResult.providerTxId`)
- [X] T037 [US4] Fix `auto_return` / `back_url` issue in `mercadopago.provider.ts:41-46` — removed `auto_return: 'approved'` at `backend/src/modules/payments/providers/mercadopago.provider.ts:46`. Relies on `notification_url` for async status updates. Fixes 500 error on localhost.

**Checkpoint**: User flow: /checkout → click "Pagar con Mercado Pago" → Wallet renders → click MP Wallet → redirected to MP → success/failure/pending page.

---

## Dependency Graph

```
Phase 1 (Setup)
    └── No deps
Phase 2 (Foundational)
    └── Depends on Phase 1
    └── BLOCKS all user stories
Phase 3 [US1] (Checkout Review Page)
    └── Depends on Phase 2
    └── Blocks US2 (redirect pages assume checkout exists)
    └── Independent test: /checkout page renders items + summary
Phase 4 [US2] (Redirect Pages)
    └── Depends on Phase 3 (redirect pages served from /checkout/*)
    └── Independent test: render with mock query params
Phase 5 [US3] (Webhook + E2E)
    └── Depends on Phase 3 (frontend flow) + Phase 4 (redirects)
    └── Independent test: backend webhook mock-only
Phase 6 (Polish)
    └── Depends on all phases
Phase 7 [US4] (Explicit Payment Provider)
    └── Depends on Phase 3 (checkout page exists)
    └── Independent test: button click → Wallet renders
```

## Parallel Opportunities

| Task IDs | Why Parallel |
|----------|-------------|
| T001, T002, T003 | Different files, no deps |
| T004, T005 | Backend + frontend, independent |
| T007, T008 | Different test files |
| T009, T010 | Different components |
| T013, T014, T015 | Different test files |
| T016, T017, T018 | Different page files |
| T020, T021 | Different test scopes |
| T023, T024 | Different components |
| T027, T028, T029, T030 | All test files, no deps |
| T031, T032 | Same file but different concerns (button vs state) |
| T036, T037 | Backend verification, no frontend deps |

## Implementation Strategy

### MVP First (US4 Only)
1. Phase 1-6 complete (cart, review page, redirects, webhook, polish)
2. Phase 7: Add "Pagar con Mercado Pago" button → Wallet flow
3. **STOP**: User can go cart → /checkout → click "Pagar con Mercado Pago" → Wallet → redirected to MP
4. Deploy/demo

### Incremental Delivery
1. Phase 1 → Setup
2. Phase 2 → Foundational (backend returns preferenceId, API helper)
3. Phase 3 → Checkout review page (items + summary, no payment)
4. Phase 4 → Redirect pages (success/failure/pending)
5. Phase 5 → Webhook processing + mock E2E tests
6. Phase 6 → Polish
7. Phase 7 [US4] → Explicit "Pagar con Mercado Pago" button → Wallet → payment flow

## Notes
- `@mercadopago/sdk-react` Wallet Brick uses `Wallet` component, not `WalletBrick` — see docs `Agregar el SDK al frontend e inicializar el checkout.md`
- `backUrl` for checkout must point to frontend success page (e.g., `https://dominio/checkout/success`) — NOT localhost per MP docs (`auto_return` requires whitelisted URLs)
- Webhook `notification_url` already set in `mercadopago.provider.ts:47` — verify `env.API_URL` is correct for production
- CartDrawer auth check remains: if no user, redirects to `/login?redirect=/checkout` before reaching checkout page
- **Payment preference NEVER created on page mount** — always user-initiated via button click
- `CheckoutPageClient.tsx` currently shows items + `OrderSummary` only. Phase 7 adds the "Pagar con Mercado Pago" button + Wallet rendering.
- `MpWalletButton.tsx` already exists with skeleton + `Wallet` component — just needs `preferenceId` prop
- `checkout.api.ts` already sends `provider: "mercadopago"` in request body — no change needed
- Backend `payments.service.ts:126` already returns `preferenceId` in response
- T037: Fix `auto_return` issue — MP requires `back_urls.success` to be a real domain (not localhost). Options: (a) disable `auto_return` in dev, (b) use a tunnel/test domain, or (c) use `notification_url`-only flow
- [P] tasks = different files, no dependencies
- Commit after each logical group
