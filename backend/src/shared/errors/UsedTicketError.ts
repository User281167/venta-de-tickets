export class UsedTicketError extends Error {
  statusCode = 409;
  code = 'USED_TICKET' as const;

  constructor(message = 'USED_TICKET') {
    super(message);
    this.name = 'UsedTicketError';
  }
}
