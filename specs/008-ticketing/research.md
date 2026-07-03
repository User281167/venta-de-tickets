# Research: Ticketing

## Schema Reconciliation

### Existing vs Proposed: Event

| Field | Existing | Spec Proposal | Decision |
|-------|----------|--------------|----------|
| `id` | UUID | UUID | Keep |
| `title` | `VarChar(200)` | `name` | Rename to `name`, drop `title` |
| `description` | — | `Text?` | Add |
| `date` | `eventDate` | `date` | Rename `eventDate` → `date` |
| `location` | — | `VarChar(255)` | Add |
| `prefix` | — | `VarChar(10)` | Add (for ticket_code generation) |
| `isActive` | `status` (EventStatus enum) | `isActive` (Boolean) | Keep `status` enum — richer state model |

**Decision**: Keep `Event.status` enum (draft/published/finished/cancelled). Add missing fields via migration. Do not drop existing fields — additive changes preserve backward compat.

### Existing vs Proposed: TicketType

| Field | Existing | Spec Proposal | Decision |
|-------|----------|--------------|----------|
| `price` | `Decimal(12,2)` | `Int` (COP cents) | Keep `Decimal(12,2)` — existing payments depend on Decimal type. Store cents as integer, display as pesos/100 |
| `totalQuantity` | `quantityTotal` | `totalQuantity` | Add alias — keep `quantityTotal` |
| `quantitySold` | `Int @default(0)` | — (computed) | **Keep `quantitySold`** for fast reads. Computed availability = `quantityTotal - quantitySold`. Updated atomically on reservation confirm. |
| `maxPerUser` | `Int?` | — | Keep — useful for reservation quantity cap |
| `isActive` | `isActive` | `isActive` | Keep |

**Decision**: Price stored as `Decimal(12,2)` representing COP (cents × 100). Frontend formats: `formatCOP(cents)` utility converts API Decimal to display string. Keep `quantitySold` counter for O(1) availability reads.

### Existing vs Proposed: Ticket

| Field | Existing | Spec Proposal | Decision |
|-------|----------|--------------|----------|
| `ticketCode` | `VarChar(100)` | `VarChar(20)` | Keep `VarChar(100)` — no reason to restrict |
| `qrToken` | — | `Text` | Add |
| `reserveExpiresAt` | `reserveExpiresAt` | Same | Keep |
| `status` | TicketStatus enum | TicketStatus enum | **Add `confirmed` to enum**, keep `active`/`used` for future check-in |

**Decision**: Add `confirmed` to `TicketStatus` enum. Existing enum values (`reserved`, `active`, `used`, `cancelled`, `expired`) remain. Status flow: `reserved → confirmed → active → used` or `reserved → expired/cancelled`.

## Technologies

### ticket_seq (Postgres Sequence)

Raw SQL migration (not Prisma-managed). Create via `prisma migrate dev --create-only` then hand-edit SQL:

```sql
CREATE SEQUENCE IF NOT EXISTS ticket_seq START 1;
```

Called inside reservation transaction via `SELECT nextval('ticket_seq')` wrapped in `$queryRawUnsafe`.

### QR_JWT_SECRET

Add to `env.ts` schema:
```ts
QR_JWT_SECRET: z.string().min(32, 'QR_JWT_SECRET min 32 chars'),
```

Separate from `SUPABASE_JWT_SECRET`. Used only by `tickets.qr.ts` module. JWT payload: `{ ticket_code, event_id, user_id, ticket_type_id }` — no expiry (ticket status is source of truth).

### node-cron

Not currently used in project. Add dependency (`npm install node-cron`). Job file at `src/shared/jobs/expire-reservations.job.ts`. Schedule: `*/2 * * * *`.

Pattern:
```ts
import cron from 'node-cron';
import { prisma } from '../database/prisma.client.js';

cron.schedule('*/2 * * * *', async () => {
  await prisma.ticket.updateMany({
    where: { status: 'reserved', reserveExpiresAt: { lte: new Date() } },
    data: { status: 'expired' },
  });
});
```

### Reservation Atomicity

Prisma doesn't natively support `SELECT ... FOR UPDATE` with raw SQL joins + inserts. Approach:

1. Use `prisma.$transaction` with isolation level
2. Inside transaction, execute raw SQL for FOR UPDATE lock + availability check + sequence nextval
3. Then use Prisma `createMany` for ticket INSERTs with generated codes

### Existing Module Patterns

- **Routes**: `Router` from express, exported as `{name}Router`
- **Controllers**: Named exports, `async (req, res) => { ... }`, throw errors or return JSON
- **Services**: Named exports, business logic only, imports from repository
- **Repositories**: Named exports, uses `prisma` client from `shared/database/prisma.client.js`
- **Types**: Interfaces and type aliases
- **Validators**: Zod schemas

## Edge Cases

- **Sequence max**: `ticket_seq` is `BIGINT` — practically infinite. If wrap needed, `ticket_code` uniqueness enforced by DB constraint.
- **Cron + concurrent reservation**: FOR UPDATE row lock prevents cron from acting on in-progress reservations. Cron skips locked rows.
- **Deactivated ticket type reservation**: Check `isActive` before FOR UPDATE lock. Return 400.
- **User multiple reservations**: Check `COUNT(tickets WHERE user_id=X AND status='reserved') > 0` before proceeding.
