import { prisma } from '../../shared/database/prisma.client.js';
import {
  InvalidPaymentStatusError,
  NotFoundError,
  SoldOutError,
  TicketTypeExpiredError,
  UsedTicketError,
} from '../../shared/errors/index.js';

export async function createAdminPaymentTransaction(input: {
  userId: string;
  provider: string;
  subtotalCents: number;
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
          sale_ends_at: Date | null;
          db_now: Date;
          only_egresados: boolean;
        }>
        >`SELECT quantity_sold, quantity_total, name, status, sale_ends_at, now() AS db_now, only_egresados
          FROM ticket_types
          WHERE id = ${item.ticketTypeId}::uuid
          FOR UPDATE`;

      const ticketType = rows[0];

      if (!ticketType) {
        throw new NotFoundError(`Ticket type not found: ${item.ticketTypeId}`);
      }

      if (
        ticketType.sale_ends_at !== null &&
        ticketType.sale_ends_at <= ticketType.db_now
      ) {
        throw new TicketTypeExpiredError(
          `Ticket type "${ticketType.name}" sale ended at ${ticketType.sale_ends_at.toISOString()}`,
          [
            {
              ticketTypeId: item.ticketTypeId,
              name: ticketType.name,
              saleEndsAt: ticketType.sale_ends_at,
            },
          ],
        );
      }

      if (
        ticketType.quantity_sold + item.quantity >
        ticketType.quantity_total
      ) {
        const available = ticketType.quantity_total - ticketType.quantity_sold;
        throw new SoldOutError(
          `Not enough tickets available for "${ticketType.name}", available: ${available}, requested: ${item.quantity}`,
          [
            {
              ticketTypeId: item.ticketTypeId,
              name: ticketType.name,
              available,
              requested: item.quantity,
            },
          ],
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
      INSERT INTO payments (id, user_id, provider, subtotal_cents, total_cents, status, created_by, created_at, updated_at)
      VALUES (gen_random_uuid(), ${input.userId}::uuid, ${input.provider}, ${input.subtotalCents}, ${input.totalCents}, 'completed', ${input.createdBy}::uuid, now(), now())
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
      totalCents: input.totalCents,
    };
  });
}

export async function refundTransaction(input: {
  paymentId: string;
  reason: string;
  processedById: string;
}) {
  return prisma.$transaction(async (tx) => {
    const paymentRows = await tx.$queryRaw<
      Array<{ status: string }>
    >`SELECT status FROM payments WHERE id = ${input.paymentId}::uuid FOR UPDATE`;

    const payment = paymentRows[0];
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (!['completed', 'completed_unfulfillable'].includes(payment.status)) {
      throw new InvalidPaymentStatusError();
    }

    const tickets = await tx.$queryRaw<
      Array<{ id: string; ticket_type_id: string; status: string }>
    >`SELECT id, ticket_type_id, status FROM tickets WHERE payment_id = ${input.paymentId}::uuid`;

    const stockToRevert = tickets.filter((t) =>
      ['paid', 'confirmed', 'pending_confirmation'].includes(t.status),
    );

    const usedTickets = tickets.filter((t) => t.status === 'used');

    if (usedTickets.length > 0) {
      throw new UsedTicketError();
    }

    if (stockToRevert.length > 0) {
      const typeCounts = new Map<string, number>();
      for (const t of stockToRevert) {
        typeCounts.set(t.ticket_type_id, (typeCounts.get(t.ticket_type_id) ?? 0) + 1);
      }

      for (const [typeId, count] of typeCounts) {
        await tx.$executeRaw`
          UPDATE ticket_types
          SET quantity_sold = GREATEST(0, quantity_sold - ${count})
          WHERE id = ${typeId}::uuid
        `;
      }
    }

    await tx.$executeRaw`
      UPDATE tickets
      SET status = 'cancelled', cancelled_at = now()
      WHERE payment_id = ${input.paymentId}::uuid
        AND status NOT IN ('used', 'expired', 'cancelled')
    `;

    await tx.$executeRaw`
      UPDATE payments
      SET status = 'refunded',
          metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
            'refund', jsonb_build_object(
              'reason', ${input.reason}::text,
              'processedBy', ${input.processedById}::text,
              'processedAt', now()
            )
          )
      WHERE id = ${input.paymentId}::uuid
    `;

    return { paymentId: input.paymentId, status: 'refunded' as const };
  });
}

export async function findCancellableTicketsByPayment(paymentId: string): Promise<
  Array<{ id: string; status: string }>
> {
  return prisma.$queryRaw<Array<{ id: string; status: string }>>`
    SELECT id, status::text AS status
    FROM tickets
    WHERE payment_id = ${paymentId}::uuid
      AND status IN ('paid', 'confirmed', 'pending_confirmation')
  `;
}
