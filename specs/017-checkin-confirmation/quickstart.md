# Quickstart — Check-in and Remote Confirmation

**Date**: 2026-07-20

## Implementation Order

### Step 1: Clean slate

Delete existing `src/modules/checkin/` directory (single-endpoint attempt, replaced by new design).

### Step 2: Environment variables

Add to `.env`:

```env
CONFIRMATION_JWT_SECRET=<generate-random-secret>
CONFIRMATION_TOKEN_TTL=30m
CONFIRMATION_LINK_BASE_URL=https://example.com
```

### Step 3: `checkin` module

Create `src/modules/checkin/` with:

| File | Purpose |
|------|---------|
| `checkin.types.ts` | Response types, error codes, allowed actions enum |
| `checkin.validators.ts` | Zod schemas for scan, confirm-entry, request-confirmation, allow-entry |
| `checkin.repository.ts` | `findTicketByQrToken`, `findTicketById`, `transitionTicketStatus(tx, id, from, to)` |
| `messaging.client.ts` | `sendConfirmationLink()` — thin interface, no-op or stub |
| `checkin.service.ts` | `scan`, `confirmEntry`, `requestConfirmation`, `allowEntry` — business logic |
| `checkin.controller.ts` | Express handlers wrapping service + error mapping |
| `checkin.routes.ts` | Router mounting controller handlers |

### Step 4: `confirmations` module

Create `src/modules/confirmations/` with:

| File | Purpose |
|------|---------|
| `confirmations.types.ts` | Response types, error codes |
| `confirmations.validators.ts` | Zod schemas for confirm, reject |
| `confirmations.middleware.ts` | Verify `CONFIRMATION_JWT_SECRET`, decode `tid`, attach to `req` |
| `confirmations.service.ts` | Calls `checkin.repository.transitionTicketStatus(...)` |
| `confirmations.controller.ts` | Express handlers |
| `confirmations.routes.ts` | Router mounting controller handlers (on `/confirmations`) |

### Step 5: Wire routes

Register `checkin.routes` on `/internal/checkin` and `confirmations.routes` on `/confirmations` in the main Express app.

### Step 6: Testing

- Unit: service logic, state transition idempotency, error mapping
- Integration: full endpoint flow with real DB (scan → confirm-entry, scan → request-confirmation → confirm → allow-entry)

## Key Implementation Details

### QR Token Decode (scan)

```ts
// The QR contains a JWT with { tid: string }
// Verify with QR_JWT_SECRET (existing project env var)
const payload = jwt.verify(qrToken, process.env.QR_JWT_SECRET) as { tid: string };
```

### Confirmation Token Issue (request-confirmation)

```ts
const token = jwt.sign(
  { tid: ticketId, purpose: 'confirm' },
  process.env.CONFIRMATION_JWT_SECRET,
  { expiresIn: process.env.CONFIRMATION_TOKEN_TTL || '30m' }
);
const link = `${process.env.CONFIRMATION_LINK_BASE_URL}/confirmaciones?token=${token}`;
await messagingClient.sendConfirmationLink({ ... });
```

### Confirmation Token Verify (confirmations middleware)

```ts
const payload = jwt.verify(token, process.env.CONFIRMATION_JWT_SECRET) as {
  tid: string;
  purpose: 'confirm';
};
if (payload.purpose !== 'confirm') throw new AppError('INVALID_TOKEN', 400);
```

### Idempotent State Transition

```ts
async transitionTicketStatus(
  tx: PrismaTransactionClient,
  ticketId: string,
  fromStatus: TicketStatus,
  toStatus: TicketStatus,
  extraData?: Record<string, unknown>
): Promise<boolean> {
  const result = await tx.tickets.updateMany({
    where: { id: ticketId, status: fromStatus },
    data: { status: toStatus, ...extraData },
  });
  return result.count > 0; // false → conflict (409)
}
```

### Messaging Client Interface

```ts
// src/modules/checkin/messaging.client.ts
// Thin interface — real implementation comes with the messaging module

export interface ConfirmationLinkPayload {
  buyerContact: string;
  channel: 'email' | 'whatsapp';
  confirmationUrl: string;
  ticketId: string;
  buyerName: string;
}

export async function sendConfirmationLink(
  payload: ConfirmationLinkPayload
): Promise<void> {
  // Stub: log to console until messaging module is built
  console.log('[messaging] sendConfirmationLink', payload);
  // When messaging module exists, delegate to:
  // await messaging.send({ ... });
}
```

## Error Mapping

| Domain Error | HTTP Status | Code |
|-------------|-------------|------|
| `InvalidQrError` | 400 | INVALID_QR |
| `NotFoundError` | 404 | NOT_FOUND |
| `TicketNotAvailableError` | 409 | TICKET_NOT_AVAILABLE |
| `InvalidTokenError` | 400 | INVALID_TOKEN |
| `ValidationError` (Zod) | 422 | VALIDATION_ERROR |

## Referenced Files

- [Research decisions](./research.md)
- [Data model + state transitions](./data-model.md)
- [Check-in contracts](./contracts/checkin.openapi.yaml)
- [Confirmations contracts](./contracts/confirmations.openapi.yaml)
