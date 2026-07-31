export type ApiErrorPayload = {
  code: string;
  message: string;
  data?: Record<string, unknown>;
};

export type FormattedError = {
  title: string;
  description: string;
};

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.code === 'string' && typeof v.message === 'string';
}

export function extractApiError(err: unknown): ApiErrorPayload {
  if (isApiErrorPayload(err)) return err;

  if (err instanceof Error) {
    return { code: 'INTERNAL_ERROR', message: err.message };
  }

  if (typeof err === 'string') {
    return { code: 'INTERNAL_ERROR', message: err };
  }

  return { code: 'INTERNAL_ERROR', message: 'Error inesperado' };
}

export function formatApiError(err: unknown): FormattedError {
  const { code, message } = extractApiError(err);

  if (code === 'CONFLICT') {
    if (/cédula|cedula/i.test(message)) {
      return {
        title: 'Cédula duplicada',
        description: 'Esta cédula ya está registrada por otro usuario.',
      };
    }

    return { title: 'Conflicto', description: message };
  }

  if (code === 'CEDULA_INVALIDATION') {
    return {
      title: 'Cédula no modificable',
      description: 'Ya tienes una cédula registrada. No puede modificarse.',
    };
  }

  if (code === 'VALIDATION_ERROR') {
    return { title: 'Datos inválidos', description: message };
  }

  if (code === 'UNAUTHORIZED') {
    return {
      title: 'Sin autorización',
      description: 'Tu sesión expiró. Vuelve a iniciar sesión.',
    };
  }

  return { title: 'Error', description: message };
}
