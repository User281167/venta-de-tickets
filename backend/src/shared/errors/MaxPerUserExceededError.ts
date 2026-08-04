export class MaxPerUserExceededError extends Error {
  statusCode = 422;
  code = 'MAX_PER_USER_EXCEEDED' as const;
  details: { alreadyHeld: number; requested: number; maxPerUser: number };

  constructor(details: {
    alreadyHeld: number;
    requested: number;
    maxPerUser: number;
  }) {
    super('MAX_PER_USER_EXCEEDED');
    this.name = 'MaxPerUserExceededError';
    this.details = details;
  }
}
