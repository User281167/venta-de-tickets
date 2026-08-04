export class SoldOutError extends Error {
  statusCode = 409;
  code = 'SOLD_OUT' as const;
  details?: unknown;

  constructor(message = 'SOLD_OUT', details?: unknown) {
    super(message);
    this.name = 'SoldOutError';
    this.details = details;
  }
}
