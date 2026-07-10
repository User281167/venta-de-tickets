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

export type PaymentWithTickets = NonNullable<
  Awaited<ReturnType<typeof findByIdWithTickets>>
>;

export type PaymentRow = Payment;
