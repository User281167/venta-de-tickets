export class NotFoundError extends Error {
  statusCode = 404;
  code = 'NOT_FOUND' as const;

  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}
