export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly data?: { emails?: string[]; cedulas?: string[] };

  constructor(
    statusCode: number,
    message: string,
    code?: string,
    data?: { emails?: string[]; cedulas?: string[] },
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code ?? "UNKNOWN_ERROR";
    this.data = data;
  }
}
