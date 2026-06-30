import { prisma } from '../../shared/database/prisma.client.js';

export function findByUserId(id: string) {
  return prisma.admin.findUnique({
    where: { id },
    select: { id: true, role: true, isActive: true },
  });
}
