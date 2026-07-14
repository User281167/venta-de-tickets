# Data Model: Client-Side Ticket Cart

## Entities

### CartItem (client-side only)

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `ticketTypeId` | `string` (UUID) | Reference to TicketType | Must match existing ticket type |
| `name` | `string` | Snapshot of ticket type name | — |
| `unitPriceCents` | `number` | Price per unit in COP (snapshot) | Must match `TicketType.price` |
| `quantity` | `number` | Number of tickets of this type | 1 ≤ quantity ≤ `min(maxPerUser, availableStock)` |
| `maxPerUser` | `number \| null` | Enforced limit (null = no limit) | Copied from TicketType |
| `availableStock` | `number` | Snapshot of remaining stock | Copied from TicketType |

### CartState (client-side only)

| Field | Type | Description |
|-------|------|-------------|
| `items` | `CartItem[]` | Current cart items |
| `eventId` | `string \| null` | Event these tickets belong to |
| `updatedAt` | `number` | Timestamp of last mutation |

### Derived Values (computed, not stored)

| Value | Formula |
|-------|---------|
| `totalItems` | `sum(items[].quantity)` |
| `subtotalCents` | `sum(items[].unitPriceCents * items[].quantity)` |
| `isEmpty` | `items.length === 0` |

## State Transitions

```
INIT (from localStorage or empty)
  │
  ├─ ADD item ──────────► items + { ticketType, quantity: 1 }
  │                        (if item exists: increment quantity)
  │
  ├─ REMOVE item ───────► items - item (removes entirely)
  │
  ├─ UPDATE quantity ───► items with updated quantity for item
  │                        (increment: qty + 1, decrement: qty - 1)
  │                        (decrement from 1 → remove item)
  │
  ├─ CLEAR ─────────────► items: [], eventId: null
  │
  └─ BUY ───────────────► no state change; triggers navigation to /login or checkout
```

## Reducer Actions

```typescript
type CartAction =
  | { type: "ADD"; ticketType: TicketType }
  | { type: "REMOVE"; ticketTypeId: string }
  | { type: "INCREMENT"; ticketTypeId: string }
  | { type: "DECREMENT"; ticketTypeId: string }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; cartState: CartState };
```

## localStorage Schema

- **Key**: `cart-{eventId}` (scoped per event)
- **Value**: JSON-serialized `CartState`
- **TTL**: No expiry; cart cleared on `CLEAR` action or when event expires
