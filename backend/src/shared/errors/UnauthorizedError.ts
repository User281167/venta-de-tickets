export class UnauthorizedError extends Error {
  statusCode = 401;
  code = 'UNAUTHORIZED' as const;

  constructor(message = 'Invalid or expired token') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
