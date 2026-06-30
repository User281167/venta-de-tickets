export class ForbiddenError extends Error {
  statusCode = 403;
  code = 'FORBIDDEN' as const;

  constructor(message = 'Access denied') {
    super(message);
    this.name = 'ForbiddenError';
  }
}
