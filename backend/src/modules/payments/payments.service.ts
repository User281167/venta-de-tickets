import { randomBytes, randomUUID } from 'crypto';
import { ForbiddenError } from '../../shared/errors/ForbiddenError.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ValidationError } from '../../shared/errors/ValidationError.js';
import * as ticketsService from '../tickets/tickets.service.js';
import * as paymentsRepo from './payments.repository.js';
import { getProvider } from './providers/provider.registry.js';
import {
  notifyPaymentConfirmed,
  notifyPaymentFailed,
  notifyPaymentRefunded,
  notifyPaymentUnfulfillable,
} from '../messaging/notifications/payment-notifications.js';

import { logger } from '../../utils/logger.js';
import { RESERVATION_EXPIRATION_INTERNAL_MILLIS , RESERVATION_EXPIRATION_PROVIDER_MILLIS } from '../../shared/config/constants.js';
import { findByUserId } from '../me/me.repository.js';

function generateTicketCode(): string {
  return randomBytes(16).toString('hex');
}

function validateTicketType(
  item: { ticketTypeId: string; quantity: number },
  ticketType: any,
) {
  if (ticketType.status !== 'enabled') {
    logger.warn(
      `Ticket type not available: ticketTypeId=${item.ticketTypeId}, name=${ticketType.name}`,
    );
    throw new ValidationError(
      'TICKET_TYPE_NOT_AVAILABLE',
      `Ticket type "${ticketType.name}" is not available`,
    );
  }

  if (item.quantity <= 0) {
    logger.warn(
      `Invalid quantity: ticketTypeId=${item.ticketTypeId}, quantity=${item.quantity}`,
    );
    throw new ValidationError(
      'INVALID_QUANTITY',
      `Quantity must be greater than 0`,
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

  const user = await findByUserId(userId);

  if (!user) {
    throw new ValidationError('USER_NOT_FOUND', 'User not found');
  }

  const missingFields: string[] = [];
  if (!user.cedula) missingFields.push('cedula');
  if (!user.fullName) missingFields.push('fullName');

  if (missingFields.length > 0) {
    throw new ValidationError(
      'USER_INFO_INCOMPLETE',
      'User info incomplete',
      { missingFields },
    );
  }

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

    validateTicketType(item, ticketType);

    // precio en con cents para payment
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

  const reserveProviderExpiresAt = new Date(Date.now() + RESERVATION_EXPIRATION_PROVIDER_MILLIS);
  const reserveExpiresAt = new Date(Date.now() + RESERVATION_EXPIRATION_INTERNAL_MILLIS );
  const paymentId = randomUUID();

  // 1. DB primero: reserva atómica de TODO el checkout
  await paymentsRepo.createCheckoutReservation({
    paymentId,
    userId,
    provider: providerName,
    subtotalCents,
    totalCents: subtotalCents,
    reserveExpiresAt,
    items: checkoutItems,
    generateTicketCode,
  });

  // 2. Provider después: si esto falla, los tickets ya reservados
  //    simplemente expirarán solos vía sweep — no hace falta rollback manual
  const provider = getProvider(providerName);

  const checkoutResult = await provider.createCheckout({
    externalReference: paymentId,
    items: checkoutItems,
    backUrl,
    expiresAt: reserveProviderExpiresAt.toISOString(),
  });

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
  logger.info(`Processing webhook: providerName=${providerName}`);
  const provider = getProvider(providerName);

  if (!provider.verifySignature(payload, headers)) {
    logger.warn(`Invalid webhook signature: providerName=${providerName}`);

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

  // Estados terminales: ya se procesó antes (reintento normal de proveedor) o quedó cerrado por otra vía.
  if (payment.status === 'completed') {
    logger.info(`Payment already completed: paymentId=${payment.id}`);
    return { received: true };
  }

  if (payment.status === 'failed' || payment.status === 'completed_unfulfillable') {
    if (event.status === 'approved') {
      // Dinero real llegando tarde sobre algo que ya cerramos: requiere revisión manual.
      logger.warn(
        `Late approval on closed payment: paymentId=${payment.id}, currentStatus=${payment.status}, externalId=${event.externalId}`,
      );
    }

    return { received: true };
  }

  // Rama de reclamo: el pago fue barrido a expired antes de que llegara el webhook.
  if (payment.status === 'expired') {
    if (event.status !== 'approved') {
      logger.info(`Declined/other event on expired payment: paymentId=${payment.id}`);
      return { received: true };
    }

    const result = await paymentsRepo.reclaimExpiredPayment({
      paymentId: payment.id,
      providerTxId: event.externalId,
      metadata: event.rawPayload as any,
    });

    if (result.outcome === 'reclaimed') {
      logger.info(`Reclaimed expired payment: paymentId=${payment.id}, tickets=${result.ticketIds.length}`);

      for (const ticketId of result.ticketIds) {
        await ticketsService.generateQrForTicket(ticketId);
      }

      void notifyPaymentConfirmed(payment.id);
    } else if (result.outcome === 'unfulfillable') {
      await paymentsRepo.markUnfulfillable(payment.id, event.externalId, event.rawPayload as any);
      logger.warn(`Payment unfulfillable (sold out on reclaim): paymentId=${payment.id}`);
      void notifyPaymentUnfulfillable(payment.id);
    } else {
      logger.info(`Reclaim already processed by concurrent webhook: paymentId=${payment.id}`);
    }

    return { received: true };
  }

  // Flujo normal: payment sigue pending.
  if (event.status === 'approved') {
    logger.info(`Approved payment: paymentId=${payment.id}, externalId=${event.externalId}`);

    const result = await paymentsRepo.processPaymentWebhook({
      paymentId: payment.id,
      providerTxId: event.externalId,
      metadata: event.rawPayload as any,
    });

    if (result.processed) {
      const paymentWithTickets = await paymentsRepo.findByIdWithTickets(payment.id);

      if (paymentWithTickets) {
        for (const ticket of paymentWithTickets.tickets) {
          await ticketsService.generateQrForTicket(ticket.id);
        }
      }

      void notifyPaymentConfirmed(payment.id);
      logger.info(`Processed payment: paymentId=${payment.id}, externalId=${event.externalId}`);
    }
  } else if (event.status === 'declined') {
    logger.info(`Declined payment: paymentId=${payment.id}, externalId=${event.externalId}`);
    await paymentsRepo.update(payment.id, { status: 'failed' });
    void notifyPaymentFailed(payment.id, 'El proveedor de pagos rechazó la transacción.');
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
  const ticketsWithPrice: Array<{
    ticketTypeId: string;
    quantity: number;
    unitPriceCents: number;
  }> = [];

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

  void notifyPaymentConfirmed(result.paymentId);

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
  // Verificar que el pago existe y está completado
  // (no se puede revertir un pago que no esté completado)
  // No se usa API de proveedor para enviar dinero
  // (requiere que se haga el pago de reembolso manual) esto solo indica a BD interna el estado del pago
  logger.info(
    `Processing refund: paymentId=${input.paymentId} reason=${input.reason} processedById=${input.processedById}`,
  );

  const refund = await paymentsRepo.refundTransaction(input);

  void notifyPaymentRefunded({
    paymentId: input.paymentId,
    reason: input.reason,
  });

  logger.info(
    `Refund processed: paymentId=${input.paymentId}, status=${refund.status}`,
  );

  return refund;
}
