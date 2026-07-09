import { prisma } from '../../shared/database/prisma.client.js';

const selectUserList = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  cedula: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

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
    select: selectUserList,
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
    select: {
      id: true,
      email: true,
      role: true,
      cedula: true,
      phone: true,
      isActive: true,
      fullName: true,
    },
  });
}

export function findByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });
}

export function findByCedula(cedula: string) {
  return prisma.user.findUnique({
    where: { cedula },
    select: { id: true, cedula: true },
  });
}

export function updateRole(id: string, role: string) {
  return prisma.user.update({
    where: { id },
    data: { role: role as any },
    select: selectUserList,
  });
}

export function create(data: {
  id: string;
  email: string;
  fullName: string;
  cedula: string | null;
  phone: string | null;
  role: string;
}) {
  return prisma.user.create({
    data: data as any,
    select: selectUserList,
  });
}

export function update(id: string, data: Record<string, unknown>) {
  return prisma.user.update({
    where: { id },
    data: data as any,
    select: selectUserList,
  });
}
