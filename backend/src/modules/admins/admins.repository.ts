import { prisma } from '../../shared/database/prisma.client.js';

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
    select: { id: true, fullName: true, email: true, role: true },
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

export function findById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true },
  });
}

export function updateRole(id: string, role: string) {
  return prisma.user.update({
    where: { id },
    data: { role: role as any },
    select: { id: true, email: true, role: true },
  });
}
