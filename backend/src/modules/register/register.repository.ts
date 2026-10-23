import { prisma } from '../../shared/database/prisma.client.js';
import { RegisterInput } from './register.schema.js';

export function putRegister(data: RegisterInput) {
  return prisma.register.create({ data });
}

export function findRegister(cedula: string) {
  return prisma.register.findUnique({
    where: { cedula },
    select: {
      name: true,
      cedula: true,
      phone: true,
      email: true,
      profesion: true,
      isEgresado: true,
      confirmed: true,
    },
  });
}

export function findAsociadoByCedula(cedula: string) {
  return prisma.$queryRaw<{ fechaFinalizacion: Date; isAsociado: boolean }[]>`
    SELECT fecha_de_finalizacion AS "fechaFinalizacion",
      fecha_de_finalizacion >= CURRENT_DATE AS "isAsociado"
    FROM asociados_list
    WHERE cedula = ${cedula}
  `.then((rows) => rows[0] ?? null);
}

export function updateRegisterConfirmation(cedula: string, confirmed: boolean) {
  return prisma.register.update({
    where: { cedula },
    data: { confirmed },
    select: { cedula: true, confirmed: true },
  });
}
