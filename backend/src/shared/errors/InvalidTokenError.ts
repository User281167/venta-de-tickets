export class InvalidTokenError extends Error {
  statusCode = 400;
  code = 'INVALID_TOKEN' as const;

  constructor(message = 'Invalid token') {
    super(message);
    this.name = 'InvalidTokenError';
  }
}
