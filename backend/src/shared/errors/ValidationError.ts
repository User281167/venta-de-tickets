export class ValidationError extends Error {
  statusCode = 422;
  code: string;
  data?: Record<string, unknown>;

  constructor(code: string, message: string, data?: Record<string, unknown>) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.data = data;
  }
}
