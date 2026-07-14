# Research: Client-Side Ticket Cart

## Resolved Decisions

### 1. Cart Persistence Strategy
- **Decision**: `useReducer` + localStorage, wrapped in React Context
- **Rationale**: Reducer pattern gives deterministic state transitions (add, remove, clear, update quantity). Context provides global access for navbar badge and cart drawer. localStorage read on mount, written on every state change via `useEffect` sync.
- **Alternatives considered**: Zustand (added dependency, unnecessary), raw `useState` + manual localStorage (looser, no action guarantees)

### 2. Max Per User Enforcement
- **Decision**: Enforce at the hook level — `canIncrement` checks `currentQuantity < min(maxPerUser, availableStock)`.
- **Rationale**: `maxPerUser: null` means no user limit (only stock limit). Matches existing `TicketType.maxPerUser` semantics. Prevent visual increment beyond bounds at component level; server also validates at checkout.
- **Alternatives considered**: Enforce only on "buy" (worse UX — let user add then reject)

### 3. Buy Flow
- **Decision**: Click "Comprar" → check `useAuth().user` → if null, redirect to `/login` with `?redirect=/entradas` → after login, cart preserved in localStorage → user proceeds to Mercado Pago checkout
- **Rationale**: Cart survives login redirect since it's in localStorage. No need to persist cart to backend for anonymous users.
- **Alternatives considered**: Checkout inline form (adds complexity, duplicates auth flow)

### 4. Single-Event Scope
- **Decision**: Cart keyed by `cart-{eventId}` in localStorage. Adding from different event warns and clears.
- **Rationale**: Current backend only serves one active event. Multi-event support is future scope.
- **Alternatives considered**: Multi-event cart (no current requirement)

### 5. Component Architecture
- **Decision**: Modular — `CartDrawer` (slide-over), `CartItemRow` (single entry, `memo`), `CartFab` (floating button with badge), `CartQuantitySpinner` (existing, reused)
- **Rationale**: Each component has single responsibility. `memo` on `CartItemRow` prevents re-render of items whose quantity didn't change. Reducer dispatch is stable reference.
- **Alternatives considered**: Monolithic cart component (harder to test, more re-renders)

### 6. Test Strategy
- **Decision**: Pure unit tests for reducer logic (`useCartReducer.test.ts`), localStorage boundary tests (`useLocalStorage.test.ts`), component integration with `TestWrapper` for CartDrawer, CartItemRow, CartFab
- **Rationale**: Reducer is pure function — fastest to test. localStorage tests mock `Storage` API. Component tests verify rendering + interaction.
- **Alternatives considered**: E2E only (slower, harder to debug)
