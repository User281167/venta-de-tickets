import { randomBytes, randomUUID } from 'crypto';
import { ForbiddenError } from '../../shared/errors/ForbiddenError.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ValidationError } from '../../shared/errors/ValidationError.js';
import * as ticketsService from '../tickets/tickets.service.js';
import * as paymentsRepo from './payments.repository.js';
import { getProvider } from './providers/provider.registry.js';

import { logger } from '../../utils/logger.js';

function generateTicketCode(): string {
  return randomBytes(16).toString('hex');
}

export async function createCheckout(
  userId: string,
  items: Array<{ ticketTypeId: string; quantity: number }>,
  backUrl: string,
  providerName: string,
) {
  logger.info(
    `Creating checkout for user: userId=${userId}, items=${JSON.stringify(items)}`,
  );

  const checkoutItems: Array<{
    ticketTypeId: string;
    name: string;
    quantity: number;
    unitPriceCents: number;
  }> = [];

  let subtotalCents = 0;

  for (const item of items) {
    const ticketType = await ticketsService.getTicketTypeById(
      item.ticketTypeId,
    );

    if (ticketType.status !== 'enabled') {
      logger.warn(
        `Ticket type not available: ticketTypeId=${item.ticketTypeId}, name=${ticketType.name}`,
      );
      throw new ValidationError(
        'TICKET_TYPE_NOT_AVAILABLE',
        `Ticket type "${ticketType.name}" is not available`,
      );
    }

    if (ticketType.maxPerUser && item.quantity > ticketType.maxPerUser) {
      logger.warn(
        `Max per user exceeded: ticketTypeId=${item.ticketTypeId}, quantity=${item.quantity}, maxPerUser=${ticketType.maxPerUser}`,
      );

      throw new ValidationError(
        'MAX_PER_USER_EXCEEDED',
        `Cannot buy more than ${ticketType.maxPerUser} of "${ticketType.name}" per user`,
      );
    }

    const available = ticketType.quantityTotal - ticketType.quantitySold;
    if (item.quantity > available) {
      logger.warn(
        `Sold out: ticketTypeId=${item.ticketTypeId}, quantity=${item.quantity}, available=${available}`,
      );
      throw new ValidationError(
        'SOLD_OUT',
        `Not enough tickets available for "${ticketType.name}"`,
      );
    }

    const unitPriceCents = Math.round(Number(ticketType.price) * 100);
    subtotalCents += unitPriceCents * item.quantity;

    logger.info(
      `Adding item to checkout: ticketTypeId=${item.ticketTypeId}, name=${ticketType.name}, quantity=${item.quantity}, unitPriceCents=${unitPriceCents}`,
    );

    checkoutItems.push({
      ticketTypeId: item.ticketTypeId,
      name: ticketType.name,
      quantity: item.quantity,
      unitPriceCents,
    });
  }

  const provider = getProvider(providerName);

  const reserveExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const paymentId = randomUUID();

  logger.info(
    `Creating checkout: paymentId=${paymentId}, userId=${userId}, subtotalCents=${subtotalCents}`,
  );

  const checkoutResult = await provider.createCheckout({
    externalReference: paymentId,
    items: checkoutItems,
    backUrl,
    expiresAt: reserveExpiresAt.toISOString(),
  });

  logger.info(
    `Checkout created: paymentId=${paymentId}, checkoutUrl=${checkoutResult.checkoutUrl}`,
  );

  await paymentsRepo.createPaymentRow({
    paymentId,
    userId,
    subtotalCents,
    totalCents: subtotalCents,
    provider: providerName,
  });

  for (const item of checkoutItems) {
    await paymentsRepo.createCheckoutTransaction({
      ticketTypeId: item.ticketTypeId,
      userId,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      paymentId,
      subtotalCents,
      totalCents: subtotalCents,
      provider: providerName,
      reserveExpiresAt,
      generateTicketCode,
    });
  }

  logger.info(`Checkout processed: paymentId=${paymentId}`);

  return {
    paymentId,
    checkoutUrl: checkoutResult.checkoutUrl,
    preferenceId: checkoutResult.providerTxId,
  };
}

export async function processWebhook(
  payload: unknown,
  headers: Record<string, string>,
  providerName: string,
) {
  logger.info(`Processing webhook: payload=${JSON.stringify(payload)}`);
  const provider = getProvider(providerName);

  if (!provider.verifySignature(payload, headers)) {
    logger.warn(
      `Invalid webhook signature: payload=${JSON.stringify(payload)}`,
    );

    throw Object.assign(new Error('Invalid webhook signature'), {
      statusCode: 400,
      code: 'INVALID_SIGNATURE',
    });
  }

  const event = await provider.parseWebhook(payload);

  const payment = await paymentsRepo.findByReference(event.reference);
  if (!payment) {
    logger.warn(`Payment not found: reference=${event.reference}`);
    throw new NotFoundError('Payment not found');
  }

  if (payment.status !== 'pending') {
    logger.info(`Payment not pending: status=${payment.status}`);
    return { received: true };
  }

  if (event.status === 'approved') {
    logger.info(
      `Approved payment: paymentId=${payment.id}, externalId=${event.externalId}`,
    );

    const result = await paymentsRepo.processPaymentWebhook({
      paymentId: payment.id,
      providerTxId: event.externalId,
      metadata: event.rawPayload as any,
    });

    if (result.processed) {
      const paymentWithTickets = await paymentsRepo.findByIdWithTickets(
        payment.id,
      );

      if (paymentWithTickets) {
        for (const ticket of paymentWithTickets.tickets) {
          await ticketsService.generateQrForTicket(ticket.id);
        }
      }

      logger.info(
        `Processed payment: paymentId=${payment.id}, externalId=${event.externalId}`,
      );
    }
  } else if (event.status === 'declined') {
    logger.info(
      `Declined payment: paymentId=${payment.id}, externalId=${event.externalId}`,
    );
    await paymentsRepo.update(payment.id, { status: 'failed' });
  }

  return { received: true };
}

export async function listMyPayments(
  userId: string,
  page: number,
  limit: number,
) {
  const [data, total] = await Promise.all([
    paymentsRepo.findAllByUserId(userId, page, limit),
    paymentsRepo.countByUserId(userId),
  ]);

  return { data, total, page, limit };
}

export async function listAllPayments(input: {
  page: number;
  limit: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}) {
  const [data, total] = await Promise.all([
    paymentsRepo.findAllPaymentsFiltered(input),
    paymentsRepo.countAllPaymentsFiltered(input),
  ]);

  const mapped = data.map((p) => ({
    id: p.id,
    userId: p.userId,
    provider: p.provider,
    providerTxId: p.providerTxId,
    subtotalCents: p.subtotalCents,
    discountCents: p.discountCents,
    totalCents: p.totalCents,
    status: p.status,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    user: p.user,
    ticketCount: p._count.tickets,
  }));

  return { data: mapped, total, page: input.page, limit: input.limit };
}

export async function getPaymentDetail(paymentId: string) {
  logger.info(`Getting payment detail: paymentId=${paymentId}`);

  const payment = await paymentsRepo.findPaymentByIdWithUser(paymentId);

  if (!payment) {
    logger.warn(`Payment not found: paymentId=${paymentId}`);
    throw new NotFoundError('Payment not found');
  }

  return payment;
}

export async function getPaymentStatus(
  paymentId: string,
  userId: string,
  userRole: string,
) {
  logger.info(`Getting payment status: paymentId=${paymentId}`);

  const payment = await paymentsRepo.findByIdWithTickets(paymentId);
  if (!payment) {
    logger.warn(`Payment not found: paymentId=${paymentId}`);
    throw new NotFoundError('Payment not found');
  }

  const isOwner = payment.userId === userId;
  const isStaff = userRole === 'admin' || userRole === 'super_admin';

  if (!isOwner && !isStaff) {
    logger.warn(
      `Access denied: paymentId=${paymentId}, userId=${userId}, userRole=${userRole}`,
    );
    throw new ForbiddenError('Access denied');
  }

  logger.info(
    `Payment status retrieved: paymentId=${paymentId}, status=${payment.status}`,
  );

  return {
    id: payment.id,
    status: payment.status,
    totalCents: payment.totalCents,
    subtotalCents: payment.subtotalCents,
    discountCents: payment.discountCents,
    provider: payment.provider,
    tickets: payment.tickets.map((t) => ({
      id: t.id,
      ticketCode: t.ticketCode,
      status: t.status,
      qrToken: t.qrToken,
    })),
  };
}

export async function createAdminPayment(input: {
  userId: string;
  provider: 'MANUAL' | 'GIFT';
  createdBy: string;
  tickets: Array<{ ticketTypeId: string; quantity: number }>;
}) {
  logger.info(
    `Creating admin payment: userId=${input.userId}, provider=${input.provider}, tickets=${JSON.stringify(input.tickets)}`,
  );

  let subtotalCents = 0;
  const ticketsWithPrice: Array<{ ticketTypeId: string; quantity: number; unitPriceCents: number }> = [];

  for (const item of input.tickets) {
    const ticketType = await ticketsService.getTicketTypeById(
      item.ticketTypeId,
    );

    const unitPriceCents = Math.round(Number(ticketType.price) * 100);
    subtotalCents += unitPriceCents * item.quantity;
    ticketsWithPrice.push({ ...item, unitPriceCents });
  }

  const result = await paymentsRepo.createAdminPaymentTransaction({
    userId: input.userId,
    provider: input.provider,
    subtotalCents,
    discountCents: 0,
    totalCents: subtotalCents,
    createdBy: input.createdBy,
    tickets: ticketsWithPrice,
    generateTicketCode,
  });

  for (const ticketId of result.ticketIds) {
    await ticketsService.generateQrForTicket(ticketId);
  }

  logger.info(
    `Admin payment created: paymentId=${result.paymentId}, ticketCount=${result.ticketIds.length}`,
  );

  return result;
}

export async function processRefund(input: {
  paymentId: string;
  reason: string;
  processedById: string;
}) {
  logger.info(
    `Processing refund: paymentId=${input.paymentId} reason=${input.reason} processedById=${input.processedById}`,
  );

  const refund = await paymentsRepo.refundTransaction(input);

  logger.info(
    `Refund processed: paymentId=${input.paymentId}, status=${refund.status}`,
  );

  return refund;
}
