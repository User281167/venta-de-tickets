# Quickstart: Admin Manual Payment

## 1. Prisma Schema

Add `createdBy` field to Payment model in `backend/prisma/schema.prisma`:

```prisma
model Payment {
  // ... existing fields  
  createdBy String?  @map("created_by") // FK → admins
  admin Admin @relation(fields: [createdBy], references: [id])
  // ... existing relations
}
```

## 2. Backend Implementation Order

### Validator (`backend/src/modules/admins/admins.validators.ts`)
Add `createAdminPaymentSchema`:
- `userId`: z.string().uuid()
- `provider`: z.enum(['MANUAL', 'GIFT'])
- `tickets`: z.array(z.object({ ticketTypeId: z.string().uuid(), quantity: z.number().int().min(1) })).min(1)

### Types (`backend/src/modules/payments/payments.types.ts`)
Add `TicketQuantityInput` and `AdminPaymentInput` interfaces.

### Repository (`backend/src/modules/payments/payments.repository.ts`)
Add `createAdminPaymentTransaction(input)`:
- Single `prisma.$transaction`:
  1. FOR UPDATE lock on each ticket_type
  2. Validate sold + quantity <= total for each (throw SOLD_OUT if any fail)
  3. Update quantity_sold += quantity for each type
  4. INSERT payment with status=completed, createdBy
  5. INSERT tickets (paid, linked to payment) for each type×quantity
  6. Return paymentId + ticketIds

### Service (`backend/src/modules/payments/payments.service.ts`)
Add `createAdminPayment(input)`:
- Fetch each ticket type, validate existence
- Calculate total amountCents
- Skip maxPerUser check
- Call repository transaction
- Generate QR for each ticket after tx succeeds

### Admin Service (`backend/src/modules/admins/admins.service.ts`)
Add `createAdminPayment(userId, provider, tickets, adminId)`:
- Validate user exists
- Call `paymentsService.createAdminPayment()`

### Controller (`backend/src/modules/admins/admins.controller.ts`)
Add `createAdminPaymentHandler`:
- Parse body with Zod
- Call `adminsService.createAdminPayment()`
- Return 201

### Routes (`backend/src/modules/admins/admins.routes.ts`)
Add `adminsRouter.post('/payments/manual', requireRole('admin'), adminsController.createAdminPaymentHandler);`

## 3. Frontend Implementation Order

### Schema (`frontend/features/admin-payments/schemas/admin-payments.schema.ts`)
Add `CreateAdminPaymentInput` type.

### Query hook (`frontend/features/admin-payments/api/admin-payments.queries.ts`)
Add `useCreateAdminPayment()` mutation:
- POST to /api/admin/payments/manual
- Invalidate admin payments + user tickets queries on success

### Dialog (`frontend/features/admin-users/components/AddPaymentDialog.tsx`)
Chakra Modal with:
- User info header
- Provider select (Manual / Gift)
- Ticket type list with quantity inputs (default 0)
- Total amount calc
- Submit button
- Success/error toast

### UserTable (`frontend/features/admin-users/components/UserTable.tsx`)
Add `paymentUser` state, pass to `AddPaymentDialog`.

### UserTableItem (`frontend/features/admin-users/components/UserTableItem.tsx`)
Add "Pago manual" action button, call `onAddPayment(user)` prop.

### UserTable (`frontend/features/admin-users/components/UserTable.tsx`)
Pass `onAddPayment` to `UserTableItem`, render `AddPaymentDialog`.
