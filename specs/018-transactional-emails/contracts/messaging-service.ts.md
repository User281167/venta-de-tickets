# MessagingService Integration Contract

## Public Methods

### sendPaymentConfirmation

```ts
sendPaymentConfirmation(payment: {
  id: string;
  amount: number;
  status: string;
  userId: string;
  eventName: string;
  customerName: string;
  customerEmail: string;
  paidAt: Date;
}): Promise<void>
```

**Trigger**: Called after `payment.repository.update(id, { status: 'paid' })` succeeds.

**Template**: `payment-confirmed`

**Variables**: `customerName`, `amount` (formatted currency), `eventName`, `paymentDate`

---

### sendTicketConfirmation

```ts
sendTicketConfirmation(ticket: {
  id: string;
  status: string;
  userId: string;
  eventName: string;
  customerName: string;
  customerEmail: string;
  qrImageUrl: string;
}): Promise<void>
```

**Trigger**: Called after `tickets.repository.update(id, { status: 'confirmed' })` succeeds.

**Template**: `ticket-confirmed`

**Variables**: `customerName`, `eventName`, `qrImageUrl`, `ticketId`

---

### sendTicketCancellation

```ts
sendTicketCancellation(ticket: {
  id: string;
  status: string;
  userId: string;
  eventName: string;
  customerName: string;
  customerEmail: string;
}): Promise<void>
```

**Trigger**: Called after `tickets.repository.update(id, { status: 'cancelled' })` succeeds.

**Template**: `ticket-cancelled`

**Variables**: `customerName`, `eventName`, `ticketId`

---

## Fire-and-Forget Rule

Callers **must** use `void` prefix (not `await`):

```ts
// Correct
void messagingService.sendPaymentConfirmation(payment);

// Incorrect — would block response
await messagingService.sendPaymentConfirmation(payment);
```

## Error Contract

- Email failures never propagate to callers
- All errors logged via `logger.error` with context (recipient, template, error message)
- No return value to caller
