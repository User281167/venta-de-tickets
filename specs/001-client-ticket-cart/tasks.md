---

description: "Task list for client-side ticket cart feature"
---

# Tasks: Client-Side Ticket Cart

**Input**: Design documents from `specs/001-client-ticket-cart/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Scope**: Frontend only — NO backend changes. All cart logic lives client-side.

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps to user story label (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: paths relative to `frontend/` directory
- Example: `features/ticket-purchase/hooks/useCartReducer.ts`

---

## Phase 1: Setup

**Purpose**: Ensure directory structure and confirm existing code

**⚠️ No backend**: All work stays in `frontend/`

- [X] T001 Verify existing structure under `frontend/features/ticket-purchase/` — api/, components/, hooks/ exist
- [X] T002 Create `frontend/features/ticket-purchase/schemas/` directory if missing

---

## Phase 2: Foundational — Cart Context + localStorage

**Purpose**: Core cart infrastructure needed by all user stories. Reducer, localStorage hook, context provider.

**Independent Test**: CartProvider wraps a test component, add/remove dispatches update state, state persists across mount/unmount via localStorage mock.

- [X] T003 [P] Create cart Zod schemas in `frontend/features/ticket-purchase/schemas/cart.schema.ts` — CartItem, CartState types
- [X] T004 [P] Create `useLocalStorage` generic hook in `frontend/features/ticket-purchase/hooks/useLocalStorage.ts` — SSR-safe, JSON parse-error fallback
- [X] T005 [P] Write `useLocalStorage` test in `frontend/features/ticket-purchase/hooks/__tests__/useLocalStorage.test.ts` — SSR safety, round-trip, corrupt data recovery
- [X] T006 Create `useCartReducer` in `frontend/features/ticket-purchase/hooks/useCartReducer.ts` — reducer with ADD, REMOVE, INCREMENT, DECREMENT, CLEAR, HYDRATE actions; `canIncrement`/`canDecrement` derived; `maxPerUser` enforcement; localStorage sync via `useLocalStorage`
- [X] T007 Write `useCartReducer` test in `frontend/features/ticket-purchase/hooks/__tests__/useCartReducer.test.ts` — each action boundary: maxPerUser, availableStock, decrement from 1 removes item
- [X] T008 Create `CartProvider` context in `frontend/providers/CartProvider.tsx` — wraps `useCartReducer`, exposes items/totalItems/subtotalCents/addItem/removeItem/increment/decrement/clearCart/canIncrement/canDecrement
- [X] T009 Rewrite `useCart` in `frontend/features/ticket-purchase/hooks/useCart.ts` — re-export from CartProvider context

**Checkpoint**: Cart context, reducer, localStorage ready. Components can consume `useCart()`.

---

## Phase 3: User Story 1 — Browse & Add Ticket Types (Priority: P1)

**Goal**: Visitor sees ticket types on `/entradas`, can add/remove quantities with number input on each card. Cart badge updates.

**Independent Test**: Load `/entradas`, see ticket type cards with name/price/stock. Click + to add. Quantity shows on card. Badge in navbar reflects total.

### Tests for US1

- [X] T010 [P] [US1] Write `useCart` integration test in `frontend/features/ticket-purchase/hooks/__tests__/useCart.test.tsx` — TicketTypeCard interaction with cart context

### Implementation for US1

- [X] T011 [US1] Update `TicketTypeCard` in `frontend/features/ticket-purchase/components/TicketTypeCard.tsx` — use `useCart()` context; show +/‑ spinner + price; disable when sold out; `memo`
- [X] T012 [US1] Update `TicketTypeGrid` in `frontend/features/ticket-purchase/components/TicketTypeGrid.tsx` — read quantities from `useCart()` context; pass handlers to cards; `memo`
- [X] T013 [US1] Update `TicketPurchaseClient` in `frontend/features/ticket-purchase/components/TicketPurchaseClient.tsx` — consume `useCart()` context; grid left + summary sidebar layout; loading/error/empty states
- [X] T014 [US1] Wire `CartProvider` into `frontend/app/(public)/layout.tsx` — wrap public routes so cart available in navbar
- [X] T015 [US1] Update `frontend/app/entradas/page.tsx` — replace placeholder with `<TicketPurchaseClient />`

**Checkpoint**: `/entradas` shows ticket types with add/remove. Cart state accessible via context. Badge updates.

---

## Phase 4: User Story 2 — Cart View & Checkout Summary (Priority: P1)

**Goal**: Visitor opens drawer with cart contents. Order summary visible as sidebar (desktop) / bottom (mobile). Can adjust quantities and see running total.

**Independent Test**: Add 2 ticket types, open drawer. See item rows with name/price/qty/total. Change quantity in drawer — total recalculates. Remove item — disappears. Empty cart shows empty state.

### Tests for US2

- [X] T016 [P] [US2] Write `CartFab` test in `frontend/features/ticket-purchase/components/__tests__/CartFab.test.tsx` — renders count, click triggers onClick
- [X] T017 [P] [US2] Write `CartItemRow` test in `frontend/features/ticket-purchase/components/__tests__/CartItemRow.test.tsx` — shows name/price/qty, increment/decrement callbacks
- [X] T018 [P] [US2] Write `CartDrawer` test in `frontend/features/ticket-purchase/components/__tests__/CartDrawer.test.tsx` — open/close, empty state, items render, "Comprar" button

### Implementation for US2

- [X] T019 [P] [US2] Create `CartFab` in `frontend/features/ticket-purchase/components/CartFab.tsx` — floating action button bottom-right; `itemCount` badge from `useCart().totalItems`; `memo`; triggers `CartDrawer` open
- [X] T020 [P] [US2] Create `CartItemRow` in `frontend/features/ticket-purchase/components/CartItemRow.tsx` — name, unit-price, `CartQuantitySpinner`, line total, remove (trash) icon; `memo` with shallow prop comparison
- [X] T021 [P] [US2] Update `OrderSummary` in `frontend/features/ticket-purchase/components/OrderSummary.tsx` — consume items from `useCart()`; sidebar sticky (desktop), collapsible bottom bar (mobile); totalAmount prominent
- [X] T022 [US2] Create `CartDrawer` in `frontend/features/ticket-purchase/components/CartDrawer.tsx` — Chakra Drawer; `CartItemRow` list; empty state "No has seleccionado entradas"; footer with total + "Comprar" button; open/close state from CartFab
- [X] T023 [US2] Add `CartFab` to `frontend/components/layout/Navbar.tsx` — show next to auth buttons, wired to CartDrawer open

**Checkpoint**: Cart drawer shows items with quantities. Summary sidebar updates in real time. Mobile responsive.

---

## Phase 5: User Story 3 — Persistence Across Navigation (Priority: P2)

**Goal**: Cart survives page navigation and full refresh via localStorage.

**Independent Test**: Add items, navigate to another page, return — cart intact. Refresh browser — cart restored.

### Implementation for US3

- [X] T024 [US3] Verify `useCartReducer` hydrates from localStorage on mount — already implemented in T006. Confirm test covers hydration path
- [X] T025 [US3] Write persistence boundary test — add item, simulate page reload (remount provider), assert item still present; use `vi.mock` for localStorage

**Checkpoint**: Cart persists across SPA navigation and full page refresh.

---

## Phase 6: User Story 4 — "Comprar" with Auth Check (Priority: P2)

**Goal**: "Comprar" button in cart drawer checks authentication. If not logged in, redirect to `/login?redirect=/entradas`. If logged in, proceed (future: Mercado Pago).

**Independent Test**: With no logged-in user, click "Comprar" → navigates to `/login?redirect=/entradas`. With mock authenticated user, click "Comprar" → no redirect (stays on page, ready for future payment integration).

### Implementation for US4

- [X] T026 [US4] Add "Comprar" button to `CartDrawer` footer — disabled when cart empty; uses `useRouter` for navigation
- [X] T027 [US4] Implement auth check in `CartDrawer` — on "Comprar" click, read `useAuth().user`; if null, `router.push("/login?redirect=/entradas")`; if user exists, show future placeholder (toast "Redirigiendo al pago...")
- [X] T028 [P] [US4] Write `CartDrawer` redirect test — mock `useAuth` returning null, click Comprar, assert `router.push` called with `/login?redirect=/entradas`; mock user, assert no redirect

**Checkpoint**: "Comprar" redirects unauthenticated users to login. Authenticated users see payment placeholder.

---

## Phase 7: Polish & Cleanup

**Purpose**: Remove old in-memory cart code, ensure test suite passes, verify all features work together.

- [X] T029 Remove old in-memory `useCart` hook logic if unused — check no remaining imports from old implementation
- [X] T030 Run full `vitest` suite for frontend — fix any failures
- [X] T031 Verify `/entradas` page renders correctly: ticket types load, add/remove works, drawer opens, Comprar redirects

---

## Dependencies & Execution Order

### Phase Dependencies

| Phase | Depends On | Notes |
|-------|-----------|-------|
| 1. Setup | — | Can start immediately |
| 2. Foundational | Phase 1 | BLOCKS all user stories |
| 3. US1 (P1) | Phase 2 | Browse & add |
| 4. US2 (P1) | Phase 2 | Cart view + sidebar |
| 5. US3 (P2) | Phase 2 | Persistence (impl in T006, test here) |
| 6. US4 (P2) | Phase 4 | Comprar button in drawer |
| 7. Polish | All phases | Final cleanup |

### Parallel Opportunities

- **Phase 2**: T003 (schemas) ‖ T004 (useLocalStorage) ‖ T005 (test) — all independent
- **Phase 4**: T016–T018 (tests) ‖ T019–T021 (components) — all independent (different files)
- **Phase 6**: T028 (test) ‖ T026–T027 (impl) — test independent of impl
- US3 and US4 can be worked on in parallel once Phase 2 completes (US3 is mostly verification)

### Parallel Example: Phase 4

```bash
# Launch all tasks together (different files, no shared dependencies):
Task: "Create CartFab in frontend/features/ticket-purchase/components/CartFab.tsx"
Task: "Create CartItemRow in frontend/features/ticket-purchase/components/CartItemRow.tsx"
Task: "Update OrderSummary in frontend/features/ticket-purchase/components/OrderSummary.tsx"
Task: "Write CartFab test in frontend/features/ticket-purchase/components/__tests__/CartFab.test.tsx"
Task: "Write CartItemRow test in frontend/features/ticket-purchase/components/__tests__/CartItemRow.test.tsx"
```

### Parallel Example: Phase 2

```bash
# Schemas, localStorage hook, and localStorage test are all independent:
Task: "Create cart Zod schemas in frontend/features/ticket-purchase/schemas/cart.schema.ts"
Task: "Create useLocalStorage in frontend/features/ticket-purchase/hooks/useLocalStorage.ts"
Task: "Write useLocalStorage test in frontend/features/ticket-purchase/hooks/__tests__/useLocalStorage.test.ts"
```

---

## Implementation Strategy

### MVP (Phase 1 + 2 + 3)

Complete Setup + Foundational + US1 → `/entradas` page shows ticket types with working add/remove. Cart context is ready. This is the functional MVP.

### Incremental Delivery

1. **Setup + Foundational** → Cart infrastructure ready (reducer, localStorage, context)
2. **US1** → `/entradas` page live with ticket types and add/remove (MVP!)
3. **US2** → Cart drawer + summary sidebar complete
4. **US3** → Persistence verified + tested
5. **US4** → Buy flow with auth redirect
6. **Polish** → Old code removed, tests passing

### Test Strategy

- **Unit (reducer)**: Pure function tests — fastest, no DOM. T007
- **Boundary (localStorage)**: Storage API mock, SSR guard. T005
- **Component (UI)**: `@testing-library/react` with `TestWrapper`. T016–T018
- **Integration (hook + component)**: Cart context + TicketTypeCard interaction. T010
- **Auth redirect**: Mock `useAuth`, spy on `router.push`. T028

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to user story for traceability
- Each user story must be independently testable
- Tests should be written alongside or before implementation
- Commit after each logical group of tasks
- All cart state lives in React Context + localStorage — no API calls except fetching ticket types
- No backend changes — no Prisma, no Express, no Supabase
