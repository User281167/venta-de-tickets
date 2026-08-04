export class InvalidPaymentStatusError extends Error {
  statusCode = 409;
  code = 'INVALID_PAYMENT_STATUS' as const;

  constructor(message = 'INVALID_PAYMENT_STATUS') {
    super(message);
    this.name = 'InvalidPaymentStatusError';
  }
}
