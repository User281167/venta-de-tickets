export class TooManyRequestsError extends Error {
  statusCode = 429;
  code: string;
  retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(message);
    this.name = 'TooManyRequestsError';
    this.code = 'RATE_LIMIT_EXCEEDED';
    this.retryAfter = retryAfter;
  }
}
