import type { Payment, Prisma } from '@prisma/client';

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

// Sweep: función interna, recibe tx, reutilizable dentro de otras transacciones ──
async function sweepExpiredReservationsInternal(
  tx: Prisma.TransactionClient,
): Promise<{ ticketsExpired: number; paymentsExpired: number }> {
  const expiredTickets = await tx.$queryRaw`
    WITH expired_tickets AS (
      UPDATE tickets
      SET status = 'expired'
      WHERE status = 'reserved'
        AND reserve_expires_at < now()
      RETURNING id, ticket_type_id, payment_id
    ),
    type_sweep AS (
      UPDATE ticket_types tt
      SET quantity_sold = tt.quantity_sold - sub.count
      FROM (
        SELECT ticket_type_id, count(*) AS count
        FROM expired_tickets
        GROUP BY ticket_type_id
      ) sub
      WHERE tt.id = sub.ticket_type_id
    )
    SELECT id, payment_id FROM expired_tickets
  ` as Array<{ id: string; payment_id: string | null }>;

  if (expiredTickets.length === 0) {
    return { ticketsExpired: 0, paymentsExpired: 0 };
  }

  const paymentIds = [
    ...new Set(expiredTickets.map((t) => t.payment_id).filter((id): id is string => id !== null)),
  ];

  let paymentsExpired = 0;
  if (paymentIds.length > 0) {
    paymentsExpired = await tx.$executeRaw`
      UPDATE payments
      SET status = 'expired'
      WHERE status = 'pending'
        AND id = ANY(${paymentIds}::uuid[])
    `;
  }

  return { ticketsExpired: expiredTickets.length, paymentsExpired };
}

// Wrapper público: abre su propia transacción, usado por el cron ──
export function sweepExpiredReservations() {
  return prisma.$transaction((tx) => sweepExpiredReservationsInternal(tx));
}

// Checkout: reutiliza la función interna dentro de SU PROPIA transacción ──
export async function createCheckoutReservation(input: {
  paymentId: string;
  userId: string;
  provider: string;
  subtotalCents: number;
  totalCents: number;
  reserveExpiresAt: Date;
  items: Array<{ ticketTypeId: string; quantity: number; unitPriceCents: number }>;
  generateTicketCode: () => string;
}) {
  return prisma.$transaction(async (tx) => {
    // 1. sweep global, reutilizando la misma tx
    await sweepExpiredReservationsInternal(tx);

    // 2. crear el payment row
    await tx.$executeRaw`
      INSERT INTO payments (id, user_id, status, subtotal_cents, discount_cents, total_cents, provider, created_at, updated_at)
      VALUES (${input.paymentId}::uuid, ${input.userId}::uuid, 'pending', ${input.subtotalCents}, 0, ${input.totalCents}, ${input.provider}, now(), now())
    `;

    // 3. validar y reservar cada item, todo dentro de la MISMA transacción
    for (const item of input.items) {
      const rows = await tx.$queryRaw`
        SELECT quantity_sold, quantity_total, status, max_per_user
        FROM ticket_types
        WHERE id = ${item.ticketTypeId}::uuid
        FOR UPDATE
      ` as Array<{ quantity_sold: number; quantity_total: number; status: string; maxPerUser: number }>;

      const ticketType = rows[0];
      if (!ticketType) {
        throw Object.assign(new Error('TICKET_TYPE_NOT_FOUND'), { statusCode: 404 });
      }
      if (ticketType.status !== 'enabled') {
        throw Object.assign(new Error('TICKET_TYPE_NOT_AVAILABLE'), { statusCode: 400 });
      }
      if (ticketType.quantity_sold + item.quantity > ticketType.quantity_total) {
        throw Object.assign(new Error('SOLD_OUT'), { statusCode: 409 });
      }
      if (ticketType.maxPerUser && item.quantity > ticketType.maxPerUser) {
        throw Object.assign(new Error('MAX_PER_USER_EXCEEDED'), { statusCode: 409 });
      }

      await tx.$executeRaw`
        UPDATE ticket_types
        SET quantity_sold = quantity_sold + ${item.quantity}
        WHERE id = ${item.ticketTypeId}::uuid
      `;

      for (let i = 0; i < item.quantity; i++) {
        const ticketCode = input.generateTicketCode();

        await tx.$executeRaw`
          INSERT INTO tickets (id, ticket_type_id, user_id, status, reserve_expires_at, ticket_code, payment_id, unit_price_cents)
          VALUES (gen_random_uuid(), ${item.ticketTypeId}::uuid, ${input.userId}::uuid, 'reserved', ${input.reserveExpiresAt}, ${ticketCode}, ${input.paymentId}::uuid, ${item.unitPriceCents})
        `;
      }
    }

    return { paymentId: input.paymentId };
  });
}

export async function reclaimExpiredPayment(input: {
  paymentId: string;
  providerTxId: string;
  metadata: Prisma.InputJsonValue;
}): Promise<
  | { outcome: 'reclaimed'; ticketIds: string[] }
  | { outcome: 'unfulfillable' }
  | { outcome: 'already_processed' }
> {
  return prisma.$transaction(async (tx) => {
    // Guard atómico: solo procede si sigue expired (evita doble reclamo por webhooks concurrentes)
    const paymentRows = await tx.$queryRaw<Array<{ status: string }>>`
      SELECT status FROM payments WHERE id = ${input.paymentId}::uuid FOR UPDATE
    `;

    const payment = paymentRows[0];

    if (!payment || payment.status !== 'expired') {
      return { outcome: 'already_processed' as const };
    }

    const tickets = await tx.$queryRaw`
      SELECT id, ticket_type_id
      FROM tickets
      WHERE payment_id = ${input.paymentId}::uuid AND status = 'expired'
    ` as Array<{ id: string; ticket_type_id: string }>;

    if (tickets.length === 0) {
      return { outcome: 'unfulfillable' as const };
    }

    const typeCounts = new Map<string, number>();
    for (const t of tickets) {
      typeCounts.set(t.ticket_type_id, (typeCounts.get(t.ticket_type_id) ?? 0) + 1);
    }

    // Bloquear todos los tipos involucrados, orden estable (por id) para evitar deadlocks
    const typeIds = [...typeCounts.keys()].sort();
    const typeRows = await tx.$queryRaw`
      SELECT id, quantity_sold, quantity_total
      FROM ticket_types
      WHERE id = ANY(${typeIds}::uuid[])
      FOR UPDATE
    ` as Array<{ id: string; quantity_sold: number; quantity_total: number }>;

    const typeMap = new Map(typeRows.map((r) => [r.id, r]));

    // Verificar cupo para TODOS los tipos antes de tocar nada (todo o nada)
    for (const [typeId, count] of typeCounts) {
      const tt = typeMap.get(typeId);

      if (!tt || tt.quantity_sold + count > tt.quantity_total) {
        return { outcome: 'unfulfillable' as const };
      }
    }

    for (const [typeId, count] of typeCounts) {
      await tx.$executeRaw`
        UPDATE ticket_types SET quantity_sold = quantity_sold + ${count}
        WHERE id = ${typeId}::uuid
      `;
    }

    await tx.$executeRaw`
      UPDATE tickets
      SET status = 'paid', purchased_at = now()
      WHERE payment_id = ${input.paymentId}::uuid AND status = 'expired'
    `;

    await tx.$executeRaw`
      UPDATE payments
      SET status = 'completed', provider_tx_id = ${input.providerTxId}, metadata = ${input.metadata}::jsonb
      WHERE id = ${input.paymentId}::uuid
    `;

    return { outcome: 'reclaimed' as const, ticketIds: tickets.map((t) => t.id) };
  });
}

export function markUnfulfillable(paymentId: string, providerTxId: string, metadata: Prisma.InputJsonValue) {
  return prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'completed_unfulfillable', providerTxId, metadata },
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
  subtotalCents: true,
  discountCents: true,
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
  discountCents: true,
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

export async function createAdminPaymentTransaction(input: {
  userId: string;
  provider: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  createdBy: string;
  tickets: Array<{
    ticketTypeId: string;
    quantity: number;
    unitPriceCents: number;
  }>;
  generateTicketCode: () => string;
}) {
  return prisma.$transaction(async (tx) => {
    const ticketIds: string[] = [];

    for (const item of input.tickets) {
      const rows = await tx.$queryRaw<
        Array<{
          quantity_sold: number;
          quantity_total: number;
          name: string;
          status: string;
        }>
      >`SELECT quantity_sold, quantity_total, name, status FROM ticket_types WHERE id = ${item.ticketTypeId}::uuid FOR UPDATE`;

      const ticketType = rows[0];

      if (!ticketType) {
        throw Object.assign(
          new Error(`Ticket type not found: ${item.ticketTypeId}`),
          {
            statusCode: 404,
            code: 'NOT_FOUND',
          },
        );
      }

      if (
        ticketType.quantity_sold + item.quantity >
        ticketType.quantity_total
      ) {
        const available = ticketType.quantity_total - ticketType.quantity_sold;
        throw Object.assign(
          new Error(
            `Not enough tickets available for "${ticketType.name}", available: ${available}, requested: ${item.quantity}`,
          ),
          {
            statusCode: 409,
            code: 'SOLD_OUT',
            details: [
              {
                ticketTypeId: item.ticketTypeId,
                name: ticketType.name,
                available,
                requested: item.quantity,
              },
            ],
          },
        );
      }

      await tx.$executeRaw`
        UPDATE ticket_types
        SET quantity_sold = quantity_sold + ${item.quantity}
        WHERE id = ${item.ticketTypeId}::uuid
      `;

      for (let i = 0; i < item.quantity; i++) {
        const ticketCode = input.generateTicketCode();

        const result = await tx.$queryRaw<Array<{ id: string }>>`
          INSERT INTO tickets (id, ticket_type_id, user_id, status, purchased_at, ticket_code, unit_price_cents)
          VALUES (gen_random_uuid(), ${item.ticketTypeId}::uuid, ${input.userId}::uuid, 'paid', now(), ${ticketCode}, ${item.unitPriceCents})
          RETURNING id
        `;
        ticketIds.push(result[0].id);
      }
    }

    const paymentRow = await tx.$queryRaw<Array<{ id: string }>>`
      INSERT INTO payments (id, user_id, provider, subtotal_cents, discount_cents, total_cents, status, created_by, created_at, updated_at)
      VALUES (gen_random_uuid(), ${input.userId}::uuid, ${input.provider}, ${input.subtotalCents}, ${input.discountCents}, ${input.totalCents}, 'completed', ${input.createdBy}::uuid, now(), now())
      RETURNING id
    `;

    const paymentId = paymentRow[0].id;

    await tx.$executeRaw`
      UPDATE tickets
      SET payment_id = ${paymentId}::uuid
      WHERE id = ANY(${ticketIds}::uuid[])
    `;

    return {
      paymentId,
      ticketIds,
      subtotalCents: input.subtotalCents,
      discountCents: input.discountCents,
      totalCents: input.totalCents,
    };
  });
}

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
      throw Object.assign(new Error('NOT_FOUND'), {
        statusCode: 404,
        code: 'NOT_FOUND',
      });
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
        typeCounts.set(
          t.ticket_type_id,
          (typeCounts.get(t.ticket_type_id) ?? 0) + 1,
        );
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
