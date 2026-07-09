import { prisma } from '../../shared/database/prisma.client.js';
import { personalInfoSelect } from './me.validators.js';

export function findByUserId(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: personalInfoSelect,
  });
}

export function upsert(userId: string, data: Record<string, unknown>) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: personalInfoSelect,
  });
}
