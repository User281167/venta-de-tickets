import type { Payment, Prisma } from '@prisma/client';

import { prisma } from '../../shared/database/prisma.client.js';
import type { PaymentStatus } from './payments.types.js';

export function create(input: {
  userId: string;
  provider: string;
  amountCents: number;
}) {
  return prisma.payment.create({
    data: {
      userId: input.userId,
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

export async function createCheckoutTransaction(input: {
  ticketTypeId: string;
  userId: string;
  quantity: number;
  paymentId: string;
  amountCents: number;
  provider: string;
  reserveExpiresAt: Date;
  generateTicketCode: () => string;
}) {
  // transacciön para crear pago, reducir stock todas las operaciones deben ser exitosas

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      WITH expired AS (
        UPDATE tickets
        SET status = 'expired'
        WHERE ticket_type_id = ${input.ticketTypeId}::uuid
          AND status = 'reserved'
          AND reserve_expires_at < now()
        RETURNING id
      )
      UPDATE ticket_types
      SET quantity_sold = quantity_sold - (SELECT count(*) FROM expired)
      WHERE id = ${input.ticketTypeId}::uuid
    `;

    const rows = await tx.$queryRaw<
      Array<{ quantity_sold: number; quantity_total: number; status: string }>
    >`SELECT quantity_sold, quantity_total, status FROM ticket_types WHERE id = ${input.ticketTypeId}::uuid FOR UPDATE`;

    const ticketType = rows[0];

    if (!ticketType) {
      throw Object.assign(new Error('TICKET_TYPE_NOT_FOUND'), {
        statusCode: 404,
      });
    }

    if (ticketType.status !== 'enabled') {
      throw Object.assign(new Error('TICKET_TYPE_NOT_AVAILABLE'), {
        statusCode: 400,
      });
    }

    if (ticketType.quantity_sold + input.quantity > ticketType.quantity_total) {
      throw Object.assign(new Error('SOLD_OUT'), { statusCode: 409 });
    }

    await tx.$executeRaw`
      UPDATE ticket_types
      SET quantity_sold = quantity_sold + ${input.quantity}
      WHERE id = ${input.ticketTypeId}::uuid
    `;

    const ticketCodes: string[] = [];

    for (let i = 0; i < input.quantity; i++) {
      const ticketCode = input.generateTicketCode();
      ticketCodes.push(ticketCode);

      await tx.$executeRaw`
        INSERT INTO tickets (id, ticket_type_id, user_id, status, reserve_expires_at, ticket_code, payment_id)
        VALUES (gen_random_uuid(), ${input.ticketTypeId}::uuid, ${input.userId}::uuid, 'reserved', ${input.reserveExpiresAt}, ${ticketCode}, ${input.paymentId}::uuid)
      `;
    }

    await tx.$executeRaw`
      INSERT INTO payments (id, user_id, status, amount_cents, provider)
      VALUES (${input.paymentId}::uuid, ${input.userId}::uuid, 'pending', ${input.amountCents}, ${input.provider})
    `;

    return { paymentId: input.paymentId };
  });
}

export async function processPaymentWebhook(input: {
  paymentId: string;
  providerTxId: string;
  metadata: Prisma.InputJsonValue;
}) {
  // actualizar checkout y crear tickets en una sola transacción

  return prisma.$transaction(async (tx) => {
    const updated = await tx.$executeRaw`
      UPDATE payments
      SET status = 'completed', provider_tx_id = ${input.providerTxId}, metadata = ${input.metadata}::jsonb
      WHERE id = ${input.paymentId}::uuid AND status = 'pending'
    `;

    if (updated === 0) return { processed: false };

    await tx.$executeRaw`
      UPDATE tickets
      SET status = 'paid', purchased_at = now()
      WHERE payment_id = ${input.paymentId}::uuid AND status = 'reserved'
    `;

    return { processed: true };
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
  amountCents: true,
  status: true,
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
  amountCents: true,
  status: true,
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
              price: true,
            },
          },
        },
      },
    },
  });
}

export type PaymentWithTickets = NonNullable<
  Awaited<ReturnType<typeof findByIdWithTickets>>
>;

export type PaymentRow = Payment;

export async function refundTransaction(input: {
  paymentId: string;
  reason: string;
  processedById: string;
}) {
  // 1. obtener el pago y verificar que esté completado
  // 2. revertir el stock de los tickets
  // 3. actualizar el estado del pago a 'refunded'
  // 4. guardar el historial de devolución

  return prisma.$transaction(async (tx) => {
    const paymentRows = await tx.$queryRaw<
      Array<{ status: string }>
    >`SELECT status FROM payments WHERE id = ${input.paymentId}::uuid FOR UPDATE`;

    const payment = paymentRows[0];
    if (!payment) {
      throw Object.assign(new Error('NOT_FOUND'), { statusCode: 404, code: 'NOT_FOUND' });
    }

    if (payment.status !== 'completed') {
      throw Object.assign(new Error('INVALID_PAYMENT_STATUS'), {
        statusCode: 409,
        code: 'INVALID_PAYMENT_STATUS',
      });
    }

    const tickets = await tx.$queryRaw<
      Array<{ id: string; ticket_type_id: string }>
    >`SELECT id, ticket_type_id FROM tickets WHERE payment_id = ${input.paymentId}::uuid`;

    if (tickets.length > 0) {
      const typeCounts = new Map<string, number>();
      for (const t of tickets) {
        typeCounts.set(t.ticket_type_id, (typeCounts.get(t.ticket_type_id) ?? 0) + 1);
      }

      await tx.$executeRaw`DELETE FROM tickets WHERE payment_id = ${input.paymentId}::uuid`;

      for (const [typeId, count] of typeCounts) {
        await tx.$executeRaw`
          UPDATE ticket_types
          SET quantity_sold = GREATEST(0, quantity_sold - ${count})
          WHERE id = ${typeId}::uuid
        `;
      }
    }

    await tx.$executeRaw`
      UPDATE payments SET status = 'refunded' WHERE id = ${input.paymentId}::uuid
    `;

    return { paymentId: input.paymentId, status: 'refunded' as const };
  });
}
