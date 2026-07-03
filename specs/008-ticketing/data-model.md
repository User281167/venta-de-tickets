# Data Model: Ticketing

## Entity: Event

Represents a single event. One primary event seeded via migration.

### Fields

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID | PK | |
| `title` | VarChar(200) | NOT NULL | Will be renamed to `name` in migration |
| `description` | Text? | NULLABLE | NEW — add via migration |
| `eventDate` | Timestamptz | NOT NULL | Will be renamed to `date` |
| `doorsOpenAt` | Timestamptz? | NULLABLE | Existing |
| `saleEndsAt` | Timestamptz? | NULLABLE | Existing |
| `location` | VarChar(255) | NULLABLE | NEW — add via migration |
| `prefix` | VarChar(10) | NULLABLE | NEW — used for ticket_code generation, e.g. `FM26` |
| `status` | EventStatus | NOT NULL, default `draft` | Existing enum: draft, published, finished, cancelled |
| `createdAt` | Timestamptz | NOT NULL | |
| `updatedAt` | Timestamptz | NOT NULL | |

### Relationships
- Has many `TicketType`
- Has many `Ticket`
- Has many `DiscountCode`

### State Transitions
```
draft → published → finished
                     ↓
                cancelled
```

---

## Entity: TicketType

Defines a category of ticket with name, price, quantity, and active status.

### Fields

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID | PK | |
| `eventId` | UUID | FK → Event.id, NOT NULL | |
| `name` | VarChar(100) | NOT NULL | |
| `description` | Text? | NULLABLE | |
| `price` | Decimal(12,2) | NOT NULL | COP cents × 100 (e.g., 120000 = $120,000 COP) |
| `quantityTotal` | Int | NOT NULL | Total tickets available |
| `quantitySold` | Int | NOT NULL, default 0 | Incremented on confirmed purchase |
| `maxPerUser` | Int? | NULLABLE | Max tickets per reservation |
| `saleEndsAt` | Timestamptz? | NULLABLE | |
| `isActive` | Boolean | NOT NULL, default true | Soft-delete flag |
| `createdAt` | Timestamptz | NOT NULL | |
| `updatedAt` | Timestamptz | NOT NULL | |

### Relationships
- Belongs to `Event`
- Has many `Ticket`

### Derived Fields
- `availableCount = quantityTotal - quantitySold` (computed, not stored)
- `isSoldOut = availableCount <= 0` (computed)

### Validation Rules
- `quantityTotal >= 0`
- `quantitySold <= quantityTotal`
- `price >= 0`
- `maxPerUser >= 1` if set

---

## Entity: Ticket

An individual ticket created at reservation time. Contains unique code, QR token, and status.

### Fields

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID | PK | |
| `ticketCode` | VarChar(100) | UNIQUE, NOT NULL | Format: `{event.prefix}-{LPAD(seq,4,'0')}` |
| `qrToken` | Text? | UNIQUE, NULLABLE | Signed JWT. NEW field |
| `status` | TicketStatus | NOT NULL, default `reserved` | See enum below |
| `reserveExpiresAt` | Timestamptz? | NULLABLE | Set on reservation, checked by cron |
| `purchasedAt` | Timestamptz? | NULLABLE | Existing |
| `cancelledAt` | Timestamptz? | NULLABLE | Existing |
| `checkedInAt` | Timestamptz? | NULLABLE | Existing |
| `checkedInBy` | UUID? | FK → User.id | Existing |
| `ticketTypeId` | UUID | FK → TicketType.id, NOT NULL | |
| `eventId` | UUID | FK → Event.id, NOT NULL | |
| `userId` | UUID | FK → User.id, NOT NULL | |
| `discountCodeId` | UUID? | FK → DiscountCode.id | Existing |
| `discountApplied` | Decimal(10,2)? | NULLABLE | Existing |
| `createdAt` | Timestamptz | NOT NULL | |

### Relationships
- Belongs to `TicketType`
- Belongs to `Event`
- Belongs to `User`
- Optionally belongs to `DiscountCode`
- Has one `Payment`
- Optionally checked in by `User` (self-referential)

### Status Transitions
```
reserved ──→ confirmed ──→ active ──→ used
    │                           │
    ├──→ expired                └──→ cancelled
    └──→ cancelled
```

### TicketStatus Enum (modified)

| Value | Meaning |
|-------|---------|
| `reserved` | Held during 10-min TTL, not yet paid |
| `confirmed` | Payment completed, ticket valid (NEW) |
| `active` | Ticket active for check-in (existing) |
| `used` | Scanned/checked in (existing) |
| `cancelled` | Refunded or admin-cancelled (existing) |
| `expired` | TTL passed without payment (existing) |

---

## Postgres Sequence: ticket_seq

- **Name**: `ticket_seq`
- **Type**: `BIGINT`
- **Start**: 1
- **Increment**: 1
- **Usage**: `nextval('ticket_seq')` called inside reservation transaction
- **Format**: `{event.prefix}-{LPAD(nextval, 4, '0')}`
- **Uniqueness**: Enforced by DB unique constraint on `ticket_code`
