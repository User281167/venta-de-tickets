import type { Prisma } from '@prisma/client';

import { prisma } from '../../shared/database/prisma.client.js';
import {
  EgresadoOnlyError,
  MaxPerUserExceededError,
  SoldOutError,
  TicketTypeExpiredError,
  TicketTypeNotAvailableError,
  TicketTypeNotFoundError,
} from '../../shared/errors/index.js';

async function sweepExpiredReservationsInternal(
  tx: Prisma.TransactionClient,
): Promise<{ ticketsExpired: number; paymentsExpired: number }> {
  const expiredTickets = (await tx.$queryRaw`
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
  `) as Array<{ id: string; payment_id: string | null }>;

  if (expiredTickets.length === 0) {
    return { ticketsExpired: 0, paymentsExpired: 0 };
  }

  const paymentIds = [
    ...new Set(
      expiredTickets
        .map((t) => t.payment_id)
        .filter((id): id is string => id !== null),
    ),
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

export function sweepExpiredReservations() {
  return prisma.$transaction((tx) => sweepExpiredReservationsInternal(tx));
}

async function validateAndReserveStock(
  tx: Prisma.TransactionClient,
  userId: string,
  item: { ticketTypeId: string; quantity: number },
  userEgresado: boolean,
): Promise<void> {
  const rows = await tx.$queryRaw<
    Array<{
      quantity_sold: number;
      quantity_total: number;
      status: string;
      max_per_user: number | null;
      sale_ends_at: Date | null;
      db_now: Date;
      only_egresados: boolean;
    }>
  >`
    SELECT
      quantity_sold,
      quantity_total,
      status,
      max_per_user,
      sale_ends_at,
      now() AS db_now,
      only_egresados
    FROM ticket_types
    WHERE id = ${item.ticketTypeId}::uuid
    FOR UPDATE
  `;

  const ticketType = rows[0];
  if (!ticketType) {
    throw new TicketTypeNotFoundError();
  }

  if (ticketType.status !== 'enabled') {
    throw new TicketTypeNotAvailableError();
  }

  if (
    ticketType.sale_ends_at !== null &&
    ticketType.sale_ends_at <= ticketType.db_now
  ) {
    throw new TicketTypeExpiredError();
  }

  if (ticketType.only_egresados && !userEgresado) {
    throw new EgresadoOnlyError();
  }

  if (ticketType.quantity_sold + item.quantity > ticketType.quantity_total) {
    throw new SoldOutError();
  }

  if (ticketType.max_per_user !== null) {
    const existingRows = await tx.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*)::bigint AS count
      FROM tickets
      WHERE user_id = ${userId}::uuid
        AND ticket_type_id = ${item.ticketTypeId}::uuid
        AND status NOT IN ('expired', 'cancelled')
    `;

    const alreadyHeld = Number(existingRows[0].count);

    if (alreadyHeld + item.quantity > ticketType.max_per_user) {
      throw new MaxPerUserExceededError({
        alreadyHeld,
        requested: item.quantity,
        maxPerUser: ticketType.max_per_user,
      });
    }
  }

  await tx.$executeRaw`
    UPDATE ticket_types
    SET quantity_sold = quantity_sold + ${item.quantity}
    WHERE id = ${item.ticketTypeId}::uuid
  `;
}

async function insertPaymentRow(
  tx: Prisma.TransactionClient,
  input: {
    paymentId: string;
    userId: string;
    provider: string;
    subtotalCents: number;
    totalCents: number;
  },
): Promise<void> {
  await tx.$executeRaw`
    INSERT INTO payments (id, user_id, status, subtotal_cents, total_cents, provider, created_at, updated_at)
    VALUES (${input.paymentId}::uuid, ${input.userId}::uuid, 'pending', ${input.subtotalCents}, ${input.totalCents}, ${input.provider}, now(), now())
  `;
}

async function insertReservedTickets(
  tx: Prisma.TransactionClient,
  input: {
    paymentId: string;
    userId: string;
    reserveExpiresAt: Date;
    item: { ticketTypeId: string; quantity: number; unitPriceCents: number };
    generateTicketCode: () => string;
  },
): Promise<void> {
  for (let i = 0; i < input.item.quantity; i++) {
    const ticketCode = input.generateTicketCode();

    await tx.$executeRaw`
      INSERT INTO tickets (id, ticket_type_id, user_id, status, reserve_expires_at, ticket_code, payment_id, unit_price_cents)
      VALUES (gen_random_uuid(), ${input.item.ticketTypeId}::uuid, ${input.userId}::uuid, 'reserved', ${input.reserveExpiresAt}, ${ticketCode}, ${input.paymentId}::uuid, ${input.item.unitPriceCents})
    `;
  }
}

export async function createCheckoutReservation(input: {
  paymentId: string;
  userId: string;
  provider: string;
  subtotalCents: number;
  totalCents: number;
  reserveExpiresAt: Date;
  userEgresado: boolean;
  items: Array<{
    ticketTypeId: string;
    quantity: number;
    unitPriceCents: number;
  }>;
  generateTicketCode: () => string;
}) {
  return prisma.$transaction(async (tx) => {
    await sweepExpiredReservationsInternal(tx);

    for (const item of input.items) {
      await validateAndReserveStock(tx, input.userId, item, input.userEgresado);
    }

    await insertPaymentRow(tx, {
      paymentId: input.paymentId,
      userId: input.userId,
      provider: input.provider,
      subtotalCents: input.subtotalCents,
      totalCents: input.totalCents,
    });

    for (const item of input.items) {
      await insertReservedTickets(tx, {
        paymentId: input.paymentId,
        userId: input.userId,
        reserveExpiresAt: input.reserveExpiresAt,
        item,
        generateTicketCode: input.generateTicketCode,
      });
    }

    return { paymentId: input.paymentId };
  });
}
