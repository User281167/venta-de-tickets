import { Prisma } from '@prisma/client';
import {
  findAsociadoByCedula,
  findRegister,
  putRegister,
  updateRegisterConfirmation,
} from './register.repository.js';
import { RegisterInput } from './register.schema.js';

export async function register(data: RegisterInput): Promise<void> {
  try {
    await putRegister(data);
  } catch (err) {
    const target =
      err instanceof Prisma.PrismaClientKnownRequestError
        ? Array.isArray(err.meta?.target)
          ? err.meta.target.join(',')
          : String(err.meta?.target ?? '')
        : '';

    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002' &&
      target.toLowerCase().includes('cedula')
    ) {
      throw Object.assign(
        new Error('Esta cédula ya se encuentra registrada.'),
        { statusCode: 409, code: 'CEDULA_ALREADY_REGISTERED' },
      );
    }

    throw err;
  }
}

export async function getRegisterEvent(cedula: string) {
  return findRegister(cedula);
}

export async function getAsociadoStatus(cedula: string) {
  const asociado = await findAsociadoByCedula(cedula);
  if (!asociado) return { isAsociado: false, fechaFinalizacion: null };

  return {
    isAsociado: asociado.isAsociado,
    fechaFinalizacion: asociado.fechaFinalizacion,
  };
}

export async function confirmRegister(cedula: string, confirmed: boolean) {
  return updateRegisterConfirmation(cedula, confirmed);
}
