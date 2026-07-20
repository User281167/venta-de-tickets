import { prisma } from '../../shared/database/prisma.client.js';

const selectTicketType = {
  id: true,
  name: true,
  description: true,
  price: true,
  quantityTotal: true,
  quantitySold: true,
  maxPerUser: true,
  saleEndsAt: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function findAllPublic(page: number, limit: number) {
  return prisma.ticketType.findMany({
    where: { status: { not: 'blocked' } },
    select: selectTicketType,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'asc' },
  });
}

export function countPublic() {
  return prisma.ticketType.count({
    where: { status: { not: 'blocked' } },
  });
}

export function findById(id: string) {
  return prisma.ticketType.findUnique({
    where: { id },
    select: selectTicketType,
  });
}

export function create(data: {
  name: string;
  description?: string;
  price: number;
  quantityTotal: number;
  maxPerUser?: number;
  saleEndsAt?: Date;
}) {
  return prisma.ticketType.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      quantityTotal: data.quantityTotal,
      maxPerUser: data.maxPerUser ?? null,
      saleEndsAt: data.saleEndsAt ?? null,
    },
    select: selectTicketType,
  });
}

export function findAllAdmin(page: number, limit: number) {
  return prisma.ticketType.findMany({
    select: selectTicketType,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'asc' },
  });
}

export function countAll() {
  return prisma.ticketType.count();
}

export function update(id: string, data: Record<string, unknown>) {
  return prisma.ticketType.update({
    where: { id },
    data: data as any,
    select: selectTicketType,
  });
}

export function updateQrToken(ticketId: string, qrToken: string) {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: { qrToken },
  });
}

const selectTicketForOwner = {
  id: true,
  ticketCode: true,
  qrToken: true,
  status: true,
  purchasedAt: true,
  createdAt: true,
  ticketType: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

export function findByUserId(userId: string, page: number, limit: number) {
  return prisma.ticket.findMany({
    where: {
      userId,
      status: { not: 'expired' }
    },
    select: selectTicketForOwner,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

export function countByUserId(userId: string) {
  return prisma.ticket.count({
    where: {
      userId,
      status: { not: 'expired' }
    },
  });
}

export function findOwnedById(ticketId: string, userId: string) {
  return prisma.ticket.findFirst({
    where: { id: ticketId, userId },
    select: selectTicketForOwner,
  });
}
