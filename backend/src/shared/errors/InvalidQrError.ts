export class InvalidQrError extends Error {
  statusCode = 400;
  code = 'INVALID_QR' as const;

  constructor(message = 'Invalid QR token') {
    super(message);
    this.name = 'InvalidQrError';
  }
}
