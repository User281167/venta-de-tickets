export class TicketTypeNotFoundError extends Error {
  statusCode = 404;
  code = 'TICKET_TYPE_NOT_FOUND' as const;

  constructor(message = 'TICKET_TYPE_NOT_FOUND') {
    super(message);
    this.name = 'TicketTypeNotFoundError';
  }
}
