# Data Model: Transactional Email Module

No new database tables. Emails are transient — not persisted (per constitution).

## Entities

### EmailProvider (interface)
- **Type**: Interface, not persisted
- **Purpose**: Abstraction over email delivery service
- **Contract**: `send(to: string, subject: string, html: string): Promise<void>`
- **Implementations**: `ResendProvider` (initial), future providers implement same interface

### EmailTemplate
- **Type**: Static `.html` files on disk
- **Path**: `backend/src/modules/messaging/templates/*.html`
- **Placeholder syntax**: `{{variable}}`
- **Instances**: `payment-confirmed.html`, `ticket-confirmed.html`, `ticket-cancelled.html`

### MessagingService (public API)
- **Type**: Service class, not persisted
- **Methods**:
  - `sendPaymentConfirmation(payment)` — fires after `markAsPaid`
  - `sendTicketConfirmation(ticket)` — fires after `confirm`
  - `sendTicketCancellation(ticket)` — fires after `cancel`

## State Transitions (Triggers)

```
Payment: * → paid         → messagingService.sendPaymentConfirmation()
Ticket: pending_confirmation → confirmed → messagingService.sendTicketConfirmation()
Ticket: * → cancelled     → messagingService.sendTicketCancellation()
```

## Variable Mapping

| Template | Variables | Source |
|----------|-----------|--------|
| `payment-confirmed` | `customerName`, `amount`, `eventName`, `paymentDate` | Payment & User records |
| `ticket-confirmed` | `customerName`, `eventName`, `qrImageUrl`, `ticketId` | Ticket & User records |
| `ticket-cancelled` | `customerName`, `eventName`, `ticketId` | Ticket & User records |
