export class TicketTypeNotAvailableError extends Error {
  statusCode = 400;
  code = 'TICKET_TYPE_NOT_AVAILABLE' as const;

  constructor(message = 'TICKET_TYPE_NOT_AVAILABLE') {
    super(message);
    this.name = 'TicketTypeNotAvailableError';
  }
}
