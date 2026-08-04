export class EgresadoOnlyError extends Error {
  statusCode = 403;
  code = 'EGRESADO_ONLY' as const;

  constructor(message = 'EGRESADO_ONLY') {
    super(message);
    this.name = 'EgresadoOnlyError';
  }
}
