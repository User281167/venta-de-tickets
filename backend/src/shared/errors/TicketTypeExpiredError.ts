export class TicketTypeExpiredError extends Error {
  statusCode = 400;
  code = 'TICKET_TYPE_EXPIRED' as const;
  details?: unknown;

  constructor(message = 'TICKET_TYPE_EXPIRED', details?: unknown) {
    super(message);
    this.name = 'TicketTypeExpiredError';
    this.details = details;
  }
}
