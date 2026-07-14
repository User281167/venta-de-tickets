# Contract: CartProvider

## Purpose
Makes cart state and actions available to all components via React Context.

## Usage

```tsx
// app/layout.tsx or app/entradas/layout.tsx
import { CartProvider } from "@/providers/CartProvider";

<CartProvider>
  {children}
</CartProvider>
```

## Exposed Context Value

```typescript
interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotalCents: number;
  addItem: (ticketType: TicketType) => void;
  removeItem: (ticketTypeId: string) => void;
  increment: (ticketTypeId: string) => void;
  decrement: (ticketTypeId: string) => void;
  clearCart: () => void;
  canIncrement: (ticketTypeId: string) => boolean;
  canDecrement: (ticketTypeId: string) => boolean;
}
```

## Hook

```tsx
// In any component:
const { items, totalItems, addItem, increment, decrement, ... } = useCart();
// from @/features/ticket-purchase/hooks/useCart
```
