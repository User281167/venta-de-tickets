import type { Prisma } from '@prisma/client';

import { prisma } from '../../shared/database/prisma.client.js';
import type { PaymentStatus } from './payments.types.js';

export function create(input: {
  userId: string;
  provider: string;
  subtotalCents: number;
  totalCents: number;
}) {
  return prisma.payment.create({
    data: {
      userId: input.userId,
      provider: input.provider,
      subtotalCents: input.subtotalCents,
      totalCents: input.totalCents,
      status: 'pending',
    },
  });
}

export function update(
  id: string,
  input: {
    status?: PaymentStatus;
    providerTxId?: string | null;
    metadata?: Prisma.InputJsonValue;
  },
) {
  const data: Prisma.PaymentUpdateInput = {};

  if (input.status !== undefined) {
    data.status = input.status;
  }

  if (input.providerTxId !== undefined) {
    data.providerTxId = input.providerTxId;
  }

  if (input.metadata !== undefined) {
    data.metadata = input.metadata;
  }

  return prisma.payment.update({
    where: { id },
    data,
  });
}

export function findByProviderTxId(providerTxId: string) {
  return prisma.payment.findFirst({
    where: { providerTxId },
  });
}

export function findByReference(reference: string) {
  return prisma.payment.findUnique({
    where: { id: reference },
  });
}

export function findByIdWithTickets(id: string) {
  return prisma.payment.findUnique({
    where: { id },
    include: {
      tickets: true,
    },
  });
}

export function findByIdWithUserAndTickets(id: string) {
  return prisma.payment.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, fullName: true } },
      tickets: {
        select: {
          id: true,
          ticketCode: true,
          qrToken: true,
          ticketType: { select: { name: true } },
        },
      },
    },
  });
}

export function findPaymentByIdWithUser(id: string) {
  return prisma.payment.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      },
      tickets: {
        include: {
          ticketType: {
            select: {
              id: true,
              name: true,
              priceCents: true,
            },
          },
        },
      },
    },
  });
}

export function updateTicketQrToken(ticketId: string, qrToken: string) {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: { qrToken },
  });
}

const selectPaymentHistory = {
  id: true,
  provider: true,
  subtotalCents: true,
  totalCents: true,
  status: true,
  createdBy: true,
  createdAt: true,
  tickets: {
    select: {
      id: true,
      ticketCode: true,
      status: true,
    },
  },
} as const;

export function findAllByUserId(userId: string, page: number, limit: number) {
  return prisma.payment.findMany({
    where: { userId },
    select: selectPaymentHistory,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

export function countByUserId(userId: string) {
  return prisma.payment.count({
    where: { userId },
  });
}

const selectPaymentAdmin = {
  id: true,
  userId: true,
  provider: true,
  providerTxId: true,
  subtotalCents: true,
  totalCents: true,
  status: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      email: true,
      fullName: true,
    },
  },
  _count: {
    select: { tickets: true },
  },
} as const;

function buildPaymentWhere(input: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  if (input.status) {
    where.status = input.status;
  }

  if (input.dateFrom || input.dateTo) {
    const createdAt: Record<string, Date> = {};

    if (input.dateFrom) createdAt.gte = new Date(input.dateFrom);
    if (input.dateTo) createdAt.lte = new Date(input.dateTo);

    where.createdAt = createdAt;
  }

  if (input.search) {
    where.user = {
      OR: [
        { fullName: { contains: input.search, mode: 'insensitive' } },
        { cedula: { contains: input.search, mode: 'insensitive' } },
        { email: { contains: input.search, mode: 'insensitive' } },
      ],
    };
  }

  return where;
}

export function findAllPaymentsFiltered(input: {
  page: number;
  limit: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}) {
  const where = buildPaymentWhere(input);

  return prisma.payment.findMany({
    select: selectPaymentAdmin,
    where,
    skip: (input.page - 1) * input.limit,
    take: input.limit,
    orderBy: { createdAt: 'desc' },
  });
}

export function countAllPaymentsFiltered(input: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}) {
  const where = buildPaymentWhere(input);

  return prisma.payment.count({ where });
}
