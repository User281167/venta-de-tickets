import type { Payment, Prisma } from '@prisma/client';

import { prisma } from '../../shared/database/prisma.client.js';
import type { PaymentStatus } from './payments.types.js';

export function create(input: {
  userId: string;
  eventId: string;
  provider: string;
  amountCents: number;
}) {
  return prisma.payment.create({
    data: {
      userId: input.userId,
      eventId: input.eventId,
      provider: input.provider,
      amountCents: input.amountCents,
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

export type PaymentWithTickets = NonNullable<
  Awaited<ReturnType<typeof findByIdWithTickets>>
>;

export type PaymentRow = Payment;
