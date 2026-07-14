# Data Model: Admin Manual Payment

## Entity: Payment (modified)

| Field | Type | Change | Notes |
|-------|------|--------|-------|
| id | UUID (PK) | Unchanged | |
| userId | UUID (FK → users) | Unchanged | Target user |
| provider | String | Unchanged | MANUAL, GIFT, or auto-generated |
| providerTxId | String? | Unchanged | |
| amountCents | Int | Unchanged | Auto-calculated from ticket prices × quantities |
| status | PaymentStatus | Unchanged | Set to "completed" for admin-created payments |
| createdBy | UUID? (FK → admins) | **Added** | Admin who created the payment. Null for user-checkout payments |
| metadata | Json? | Unchanged | |
| createdAt | DateTime | Unchanged | |
| updatedAt | DateTime | Unchanged | |

### Relationships

- Payment belongs to **User** (buyer) via `userId`
- Payment MAY belong to **Admin** (creator) via `createdBy` — only MANUAL/GIFT providers
- Payment has many **Ticket** records

## Validation Rules

- `provider` must be `MANUAL` or `GIFT` for admin-created payments
- `createdBy` is required when provider is MANUAL or GIFT
- `createdBy` is null when provider is auto-generated (Mercado Pago checkout)
- Payment status = `completed` for admin-created (no gateway confirmation needed)
- `amountCents` auto-calculated: sum of (ticketType.price × quantity) for each ticket type
- Tickets array min 1 item, each quantity >= 1

## Prisma Schema Change

```prisma
model Payment {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  provider     String
  providerTxId String?  @map("provider_tx_id")
  amountCents  Int      @map("amount_cents")
  status       PaymentStatus @default(pending)
  createdBy    String?  @map("created_by") // NEW — FK to admins
  metadata     Json?
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  user  User  @relation(fields: [userId], references: [id])
  admin Admin @relation(fields: [createdBy], references: [id]) // NEW
  tickets Ticket[]

  @@map("payments")
}
```
