---

description: "Task list for Mercado Pago checkout integration"
---

# Tasks: Mercado Pago Checkout Integration

**Feature**: Client-Side Ticket Cart (iteration 2 — checkout + payment gateway)

**Input**: spec.md, plan.md, docs/mercadopago/*.md, backend modules/payments/

**Prerequisites**: All Phase 1-7 tasks completed (cart context, localStorage persistence, CartDrawer with auth check, 42 tests passing)

## Architecture Notes

- **Backend checkout endpoint**: `POST /api/payments/checkout` (auth required) — accepts `{ items: [{ticketTypeId, quantity}], backUrl, provider }` — currently returns `{ paymentId, checkoutUrl }`
- **Backend webhook**: `POST /api/payments/webhook/:provider` — already fully implemented in `mercadopago.provider.ts` with signature validation, status normalization, and payment processing
- **Frontend SDK**: `@mercadopago/sdk-react@1.0.7` already installed in `frontend/package.json`
- **Existing cart types**: `CartItem` has `ticketTypeId`, `quantity`, `unitPriceCents`, `name` — maps directly to backend checkout items
- **Backend `providerTxId`** = Mercado Pago `preferenceId` — needed by Wallet Brick but NOT currently returned in checkout response

---

## Phase 1: Setup & Integration Review

**Purpose**: Configure env vars, review backend compatibility, plan integration surface

- [X] T001 Add `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` to `frontend/.env.local.example` (user said: env files are gitignored; only example file needed for setup reference)
- [ ] T002 Review backend checkout response — confirm `createCheckout` in `payments.service.ts` returns `preferenceId` (alias for `providerTxId` from `mercadopago.provider.ts`); if missing, add it alongside `paymentId` / `checkoutUrl`
- [ ] T003 Create Mercado Pago initialization module at `frontend/features/ticket-purchase/lib/initMercadoPago.ts` — calls `initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY)` once, exports ready flag

---

## Phase 2: Foundational

**Purpose**: Backend response update + frontend API helper — blocks all user stories

- [X] T004 Modify `payments.service.ts:createCheckout` return to include `preferenceId: checkoutResult.providerTxId` in response — frontend Wallet Brick needs this
- [X] T005 Create checkout API helper at `frontend/features/ticket-purchase/api/checkout.api.ts` — `createCheckoutPreference(items: CheckoutItem[], backUrl: string)` calls `POST /api/payments/checkout`, returns `{ paymentId, checkoutUrl, preferenceId }`; uses Supabase session token for auth
- [X] T006 Update CartDrawer `handleBuy` in `frontend/features/ticket-purchase/components/CartDrawer.tsx` — replace `toast.info` + redirect with `router.push("/checkout")` (auth redirect to `/login?redirect=/checkout` if no user); removed unused `sonner` import; updated tests accordingly

**Checkpoint**: Cart → /checkout navigation works. Backend returns preferenceId.

---

## Phase 3: User Story 1 — Checkout Page with Mercado Pago Wallet (Priority: P1)

**Goal**: Full-page checkout showing cart items, order summary sidebar, and Mercado Pago Wallet Brick button. User clicks Wallet → redirected to MP hosted checkout.

**Independent Test**: Load `/checkout` with items in cart → items + summary + Wallet button render. Wallet button renders without error.

### Tests for User Story 1

- [X] T007 [P] [US1] Test `checkout.api.ts` — mock fetch, verify correct body (`items`, `backUrl`, `provider`) sent to backend, verify response parsed (5 tests)
- [X] T008 [P] [US1] Test CheckoutPage rendering — mock `useCart` with items, assert items list + OrderSummary + Wallet container rendered; mock empty cart, assert redirect (3 tests)
- [X] T009 [P] [US1] Create `CheckoutPageClient` component at `frontend/features/ticket-purchase/components/CheckoutPageClient.tsx` — reads cart via `useCart()`, renders items list (left) + `OrderSummary` with `hideComprar` (right, sticky sidebar) + `MpWalletButton` at summary bottom; handles empty cart (redirect to `/entradas`)
- [X] T010 [P] [US1] Create `MpWalletButton` component at `frontend/features/ticket-purchase/components/MpWalletButton.tsx` — wraps `<Wallet initialization={{ preferenceId }} />` from `@mercadopago/sdk-react`; receives `preferenceId` as prop; shows loading skeleton while preference is being created
- [X] T011 [US1] Create checkout page route at `frontend/app/(public)/checkout/page.tsx` — imports and renders `CheckoutPageClient`
- [X] T012 [US1] Wire checkout flow: on mount, `CheckoutPageClient` calls `createCheckoutPreference(items, backUrl)` with `backUrl = window.origin + "/checkout/success"`; passes returned `preferenceId` to `MpWalletButton` (done inside CheckoutPageClient)

**Checkpoint**: User can navigate cart → /checkout → see items + summary → see Wallet Brick → click MP button → redirected to Mercado Pago

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

- [ ] T020 [US3] Write webhook integration test — mock `paymentClient.get` returning approved status, POST to `/api/payments/webhook/mercadopago`, assert payment updated + tickets created
- [ ] T021 [US3] Write full flow integration test (mock-based): add items to cart → navigate to checkout → "createPreference" mock returns preferenceId → Wallet button renders → mock MP redirect to success → cart cleared
- [ ] T022 [US3] Verify `notification_url` in `mercadopago.provider.ts` points to correct public URL (`env.API_URL + "/api/payments/webhook"`) — no mismatch

**Checkpoint**: Webhook processes payments end-to-end. Frontend flow works with mocks.

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Error handling, loading states, visual polish

- [ ] T023 Add loading skeleton state to `MpWalletButton` while preference is being created — show shimmer placeholder matching Wallet button dimensions
- [ ] T024 Add error state to `CheckoutPageClient` — if preference creation fails, show error message + "Volver a intentar" button that retries `createCheckoutPreference`
- [ ] T025 Run full `vitest` suite — verify no regressions across all 42+ existing tests plus new checkout tests
- [ ] T026 Verify `/entradas` page still works end-to-end: ticket types load, add/remove, CartDrawer opens, Comprar navigates to /checkout

---

## Dependency Graph

```
Phase 1 (Setup)
    └── No deps
Phase 2 (Foundational)
    └── Depends on Phase 1
    └── BLOCKS all user stories
Phase 3 [US1] (Checkout Page + Wallet)
    └── Depends on Phase 2
    └── Blocks US2 (redirect pages assume checkout exists)
    └── Independent test: /checkout page renders
Phase 4 [US2] (Redirect Pages)
    └── Depends on Phase 3 (redirect pages served from /checkout/*)
    └── Independent test: render with mock query params
Phase 5 [US3] (Webhook + E2E)
    └── Depends on Phase 3 (frontend flow) + Phase 4 (redirects)
    └── Independent test: backend webhook mock-only
Phase 6 (Polish)
    └── Depends on all phases
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

## Implementation Strategy

### MVP First (US1 Only)
1. Phase 1: Setup env vars + review backend
2. Phase 2: Backend returns preferenceId, API helper, CartDrawer redirect
3. Phase 3: Checkout page with Wallet Brick
4. **STOP**: User can go cart → /checkout → click MP Wallet → redirected to MP
5. Deploy/demo

### Incremental Delivery
1. MVP (US1) → Checkout page working with Wallet
2. Add US2 → Redirect pages handle MP return
3. Add US3 → Webhook verified, mock E2E tests
4. Polish → Loading states, error recovery

## Notes
- `@mercadopago/sdk-react` Wallet Brick uses `Wallet` component, not `WalletBrick` — see docs `Agregar el SDK al frontend e inicializar el checkout.md`
- `backUrl` for checkout must point to frontend success page (e.g., `https://dominio/checkout/success`) — NOT localhost per MP docs
- Webhook `notification_url` already set in `mercadopago.provider.ts:47` — verify `env.API_URL` is correct for production
- CartDrawer auth check remains: if no user, redirects to `/login?redirect=/checkout` before reaching checkout page
- [P] tasks = different files, no dependencies
- Commit after each logical group
