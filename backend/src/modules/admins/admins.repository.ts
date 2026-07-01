import { prisma } from '../../shared/database/prisma.client.js';

export function findById(id: string) {
  return prisma.admin.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
    },
  });
}

/** @deprecated Utilice findById en su lugar. Se mantiene por compatibilidad con versiones anteriores. */
export const findByUserId = findById;

export function findAll(page: number, limit: number, search?: string) {
  const where = search
    ? {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  return prisma.user.findMany({
    where,
    select: { id: true, fullName: true, email: true },
    skip: (page - 1) * limit,
    take: limit,
  });
}

export function countAll(search?: string) {
  const where = search
    ? {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  return prisma.user.count({ where });
}
