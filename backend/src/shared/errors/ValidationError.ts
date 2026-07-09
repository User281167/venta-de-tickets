export class ValidationError extends Error {
  statusCode = 422;
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
  }
}
