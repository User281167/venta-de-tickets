# Quickstart: Client-Side Ticket Cart

## Files to Create

### 1. `frontend/features/ticket-purchase/schemas/cart.schema.ts`
Zod schemas for CartItem and CartState types.

### 2. `frontend/features/ticket-purchase/hooks/useLocalStorage.ts`
Generic hook: `useLocalStorage<T>(key, initialValue) → [value, setValue]`. Reads on mount, writes on set. Handles SSR (window check), parse errors gracefully.

### 3. `frontend/features/ticket-purchase/hooks/useCartReducer.ts`
`useReducer`-based hook with:
- Actions: ADD, REMOVE, INCREMENT, DECREMENT, CLEAR, HYDRATE
- `canIncrement`/`canDecrement` derived from state
- Initial state from localStorage via `useLocalStorage`
- Sync to localStorage on state change

### 4. `frontend/providers/CartProvider.tsx`
React context wrapping `useCartReducer`. Exposes `items`, `totalItems`, `subtotalCents`, `addItem`, `removeItem`, `increment`, `decrement`, `clearCart`, `canIncrement`, `canDecrement`.

### 5. `frontend/features/ticket-purchase/hooks/useCart.ts`
Re-exports context consumer: `export { useCart } from "@/providers/CartProvider"`.

### 6. `frontend/features/ticket-purchase/components/CartFab.tsx`
Floating button (bottom-right). Shows `itemCount` badge. `memo` wrapped. Click opens drawer.

### 7. `frontend/features/ticket-purchase/components/CartDrawer.tsx`
Chakra `Drawer` with `DrawerBody` containing cart item list. Empty state with "No has seleccionado entradas" message. Footer with total + "Comprar" button.

### 8. `frontend/features/ticket-purchase/components/CartItemRow.tsx`
Single cart item: name, unit price, quantity spinner, line total, remove button. `memo` with shallow comparison.

## Files to Modify

### 9. `frontend/features/ticket-purchase/components/TicketTypeCard.tsx`
Replace `CartQuantitySpinner` with "Agregar" button when quantity = 0. Keep spinner for quantity > 0. Add visual feedback on add.

### 10. `frontend/features/ticket-purchase/components/TicketPurchaseClient.tsx`
Remove inline `useCart` usage. Use `useCart()` from context instead. Add `CartFab`. Integrate `CartDrawer`.

### 11. `frontend/app/entradas/page.tsx`
Replace placeholder "no disponible" message with `<TicketPurchaseClient />`.

### 12. `frontend/app/(public)/layout.tsx`
Wrap with `<CartProvider>` so cart state is available in Navbar area.

### 13. `frontend/components/layout/Navbar.tsx`
Add `CartFab` next to auth buttons (if not on entradas page, or show everywhere).

## Test Files

### 14. `frontend/features/ticket-purchase/hooks/__tests__/useCartReducer.test.ts`
- Pure reducer test: ADD, REMOVE, INCREMENT, DECREMENT, CLEAR
- Boundary: cannot exceed `maxPerUser`, cannot exceed `availableStock`
- localStorage read/write integration

### 15. `frontend/features/ticket-purchase/hooks/__tests__/useLocalStorage.test.ts`
- SSR safety (no `window`)
- JSON parse error recovery (falls back to default)
- Write and read round-trip

### 16. `frontend/features/ticket-purchase/hooks/__tests__/useCart.test.ts`
- Integration: `TicketTypeCard` interaction with cart

### 17. `frontend/features/ticket-purchase/components/__tests__/CartFab.test.tsx`
- Renders with correct count
- Click triggers `onClick`

### 18. `frontend/features/ticket-purchase/components/__tests__/CartItemRow.test.tsx`
- Shows name, price, quantity
- Calls `onIncrement`/`onDecrement` on button click

### 19. `frontend/features/ticket-purchase/components/__tests__/CartDrawer.test.tsx`
- Open/close states
- Empty cart message
- Renders cart items
- "Comprar" button redirects unauthenticated users
