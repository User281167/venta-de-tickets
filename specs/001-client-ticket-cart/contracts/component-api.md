# Contract: Component API

## CartFab

Floating action button with cart item count badge. Visible on all pages.

```typescript
interface CartFabProps {
  itemCount: number;
  onClick: () => void;
}
```

## CartDrawer

Slide-over panel showing cart contents and "Comprar" action.

```typescript
interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}
```

## CartItemRow

Single row inside the drawer for one ticket type.

```typescript
interface CartItemRowProps {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  canIncrement: boolean;
  canDecrement: boolean;
}
```
