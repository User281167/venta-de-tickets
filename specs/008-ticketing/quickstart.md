# Quickstart: Ticketing

## Build Order

```
010a (schema + migration + seed)
  │
010b (ticket types admin)
  │
011  (public event page)
  │
012  (reservation API + frontend)
  │
013  (cron expiration job — parallel with 012)
```

## Step 010a: Schema + Migration + Seed

1. **Modify Prisma schema**:
   - Add to `Event`: `description`, `location`, `prefix` fields
   - Add `qrToken` to `Ticket`
   - Add `confirmed` to `TicketStatus` enum
   - Create raw SQL migration for `ticket_seq` sequence

2. **Run migration**:
   ```bash
   npx prisma migrate dev --name ticketing_schema
   npx prisma generate
   ```

3. **Update seed.ts**:
   - Insert event record (title, date, location, prefix `FM26`, status `published`)
   - Insert 3-4 initial ticket types (General, VIP, Early Bird, etc.)

## Step 010b: Ticket Types Admin

1. Create `src/modules/ticket-types/` with:
   - `ticket-types.repository.ts` — findAll, create, update, soft-delete
   - `ticket-types.service.ts` — CRUD business logic
   - `ticket-types.controller.ts` — Express handlers
   - `ticket-types.validators.ts` — Zod schemas
   - `ticket-types.routes.ts` — mount under admin middleware

2. Create frontend feature `src/features/ticket-types/`:
   - `TicketTypeForm.tsx` — create/edit form
   - `TicketTypeCard.tsx` — list card with status toggle
   - Admin page at `app/admin/ticket-types/page.tsx`

## Step 011: Public Event Page

1. **Backend**: Add `GET /api/events/:eventId` to `ticket-types.repository.ts`:
   - Query event + active ticket types with `availableCount = quantityTotal - quantitySold`

2. **Frontend**:
   - Page at `app/(public)/eventos/[eventId]/page.tsx`
   - `TicketTypeCard.tsx` — shows price, availability, "Comprar" button
   - Sold-out types display "Agotado"
   - Unauthenticated → redirect to `/login?returnUrl=...`

## Step 012: Reservation

1. Add `QR_JWT_SECRET` to `env.ts`
2. Create `tickets.qr.ts` — `signQrToken()`, `verifyQrToken()`
3. Create `src/modules/tickets/`:
   - `tickets.repository.ts` — `reserveAtomic()` with `$transaction` + raw SQL FOR UPDATE
   - `tickets.service.ts` — validate availability, user limits, call reserveAtomic
   - `tickets.validators.ts` — Zod schema for reserve request
   - `tickets.controller.ts` — POST /api/tickets/reserve
   - `tickets.routes.ts` — mount under auth middleware

4. Frontend:
   - `TicketSelector.tsx` — quantity picker + submit
   - `ReservationTimer.tsx` — countdown from server timestamp
   - `ReservationExpired.tsx` — expired reservation notice
   - `useReservationTimer.ts` — hook deriving remaining seconds from `reserve_expires_at`

## Step 013: Cron Job

1. `npm install node-cron`
2. Create `src/shared/jobs/expire-reservations.job.ts`:
   ```ts
   import cron from 'node-cron';
   import { prisma } from '../database/prisma.client.js';

   export function startExpirationJob() {
     cron.schedule('*/2 * * * *', async () => {
       await prisma.ticket.updateMany({
         where: {
           status: 'reserved',
           reserveExpiresAt: { lte: new Date() },
         },
         data: { status: 'expired' },
       });
     });
   }
   ```
3. Call `startExpirationJob()` on app startup (in main server entry point).

## Key Decisions

- **Price**: Stored as `Decimal(12,2)` (existing). Frontend displays via `formatCOP(cents)`.
- **Availability**: `quantityTotal - quantitySold` — fast O(1) read using existing counter.
- **QR JWT**: No expiry in token — ticket status in DB is source of truth.
- **Ticket code**: Generated via `SELECT nextval('ticket_seq')` inside reservation transaction.
- **One reservation per user**: Checked before FOR UPDATE lock — `COUNT(tickets WHERE user_id=X AND event_id=Y AND status='reserved')`.
