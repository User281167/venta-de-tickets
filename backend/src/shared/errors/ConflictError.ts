export class ConflictError extends Error {
  statusCode = 409;
  code = 'CONFLICT' as const;
  data?: Record<string, unknown>;

  constructor(message = 'Conflict', data?: Record<string, unknown>) {
    super(message);
    this.name = 'ConflictError';
    this.data = data;
  }
}
