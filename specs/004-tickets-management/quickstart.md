# Quickstart: Tickets Management

## Implementation Order

### Step 1: Prisma Schema + Migration

1. Add `TicketStatus` enum to `schema.prisma`:
```prisma
enum TicketStatus {
  enabled
  disabled
  blocked
}
```

2. Update `TicketType` model — replace `isActive Boolean` with `status TicketStatus @default(enabled)`

3. Generate migration:
```bash
cd backend
npx prisma migrate dev --name add_ticket_status_enum
```

4. Verify migration SQL maps `isActive=true` → `enabled`, `isActive=false` → `disabled`

### Step 2: Remove Old Module

1. Delete `backend/src/modules/ticket-types/` directory entirely
2. Remove route registrations in `backend/src/app.ts` that reference `ticket-types`

### Step 3: Create New Tickets Module

Create files in `backend/src/modules/tickets/`:

```
tickets/
├── index.ts                  # Barrel: re-export router + types
├── tickets.routes.ts         # Public + admin route definitions
├── tickets.controller.ts     # Request handlers
├── tickets.service.ts        # Business logic
├── tickets.repository.ts     # Prisma queries
├── tickets.validators.ts     # Zod schemas
├── tickets.types.ts          # DTOs, Response types
└── tickets.config.ts         # Module constants (page defaults, etc.)
```

Key implementation details:
- Reuse `paginationSchema` from shared or inline in validators
- Reuse `authMiddleware` and `adminMiddleware` from `shared/middlewares/`
- Use existing error classes (`NotFoundError`, `ValidationError`, `ForbiddenError`)
- Controller: `.parse()` with try/catch style (like admins)

### Step 4: Register Routes in app.ts

```typescript
// Public routes
app.use('/api/tickets', ticketsRouter);

// Admin routes (auth + admin middleware applied at router level)
app.use('/api/admin/tickets', adminTicketsRouter);
```

### Step 5: Tests

Create under `backend/tests/`:

- `unit/tickets/tickets.service.test.ts` — test business rules (price/quantity validation, status transitions, quantity cannot drop below sold)
- `unit/tickets/tickets.validators.test.ts` — test Zod schemas
- `integration/tickets/tickets.api.test.ts` — test endpoints via supertest

Key test scenarios:
- Create with valid/invalid data
- Update quantity cannot go below sold
- List excludes blocked, includes disabled
- Non-admin gets 403 on mutations
- Pagination edge cases

### Step 6: Verify

```bash
cd backend
npx prisma migrate status        # Confirm clean migration
npx vitest run                    # Tests pass
npm run dev                       # Server starts without errors
curl http://localhost:3001/api/tickets  # List works without auth
```
