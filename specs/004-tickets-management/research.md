# Research: Tickets Management

## Existing Schema Audit

Current `TicketType` model in `backend/prisma/schema.prisma`:

```prisma
model TicketType {
  id            String   @id @default(uuid())
  name          String
  description   String?
  price         Decimal
  quantityTotal Int
  quantitySold  Int       @default(0)
  maxPerUser    Int?
  saleEndsAt    DateTime?
  isActive      Boolean   @default(true)
  createdAt     DateTime
  updatedAt     DateTime
  tickets       Ticket[]
  @@map("ticket_types")
}
```

**Required changes**:
- Replace `isActive Boolean` with `status TicketStatus @default(enabled)`
- Add `TicketStatus` enum: `enabled`, `disabled`, `blocked`
- Migration: `isActive=true` → `enabled`, `isActive=false` → `disabled`

## Existing Module Audit

Current `backend/src/modules/ticket-types/` has:
- Routes (public + admin), controller, service, repository, validators, types
- References `eventId` in queries — spec says event-agnostic
- Uses `isActive` boolean filter — needs three states

**Decision**: Delete `ticket-types/` module entirely. Create new `tickets/` module following flat-file convention.

## Patterns Reused

| Pattern | Source | Notes |
|---------|--------|-------|
| Pagination schema | `admins.validators.ts` | Shared `paginationSchema` — move to shared or inline in tickets |
| Auth middleware | `shared/middlewares/auth.middleware.ts` | JWT verification → req.user |
| Admin middleware | `shared/middlewares/admin.middleware.ts` | Role check |
| Error classes | `shared/errors/` | NotFoundError, ValidationError, ForbiddenError |
| Error handler | `shared/middlewares/error-handler.middleware.ts` | Global catch-all |
| Env config | `shared/config/env.ts` | Typed env access |
| Prisma client | `shared/database/prisma.client.ts` | Singleton |
| Validation style | `.parse()` with try/catch | Used in admins controller |
| Response shape | `{ data, total, page, limit }` | Paginated list response |

## Migration Strategy

1. Add `TicketStatus` enum to `schema.prisma`
2. Replace `isActive Boolean` with `status TicketStatus @default(enabled)`
3. Generate migration: `npx prisma migrate dev --name add_ticket_status_enum`
4. Verify `isActive=true` → `enabled`, `isActive=false` → `disabled` in migration SQL
5. Drop old `ticket-types/` module directory
6. Create new `tickets/` module

## Open Questions (Resolved)

- **Event association**: Spec says event-agnostic. Do NOT add `eventId`. Existing `ticket-types` references to events are part of old implementation being replaced.
- **isActive → status mapping**: `true` → `enabled`, `false` → `disabled`. No data loss — blocked state only applies to new explicit admin action.
- **Blocked tickets visibility**: Blocked excluded from public list. Admin list includes all states. Single ID retrieval returns any state.
