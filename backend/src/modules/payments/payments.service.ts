import { randomBytes, randomUUID } from 'crypto';
import { ForbiddenError } from '../../shared/errors/ForbiddenError.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ValidationError } from '../../shared/errors/ValidationError.js';
import * as ticketsService from '../tickets/tickets.service.js';
import * as paymentsRepo from './payments.repository.js';
import { getProvider } from './providers/provider.registry.js';

function generateTicketCode(): string {
  return randomBytes(16).toString('hex');
}

export async function createCheckout(
  userId: string,
  items: Array<{ ticketTypeId: string; quantity: number }>,
  backUrl: string,
  providerName: string,
) {
  const checkoutItems: Array<{
    ticketTypeId: string;
    name: string;
    quantity: number;
    unitPriceCents: number;
  }> = [];

  let totalAmountCents = 0;

  for (const item of items) {
    const ticketType = await ticketsService.getTicketTypeById(item.ticketTypeId);

    if (ticketType.status !== 'enabled') {
      throw new ValidationError('TICKET_TYPE_NOT_AVAILABLE', `Ticket type "${ticketType.name}" is not available`);
    }

    if (ticketType.maxPerUser && item.quantity > ticketType.maxPerUser) {
      throw new ValidationError(
        'MAX_PER_USER_EXCEEDED',
        `Cannot buy more than ${ticketType.maxPerUser} of "${ticketType.name}" per user`,
      );
    }

    const available = ticketType.quantityTotal - ticketType.quantitySold;
    if (item.quantity > available) {
      throw new ValidationError(
        'SOLD_OUT',
        `Not enough tickets available for "${ticketType.name}"`,
      );
    }

    const unitPriceCents = Math.round(Number(ticketType.price) * 100);
    totalAmountCents += unitPriceCents * item.quantity;

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

  const checkoutResult = await provider.createCheckout({
    externalReference: paymentId,
    items: checkoutItems,
    backUrl,
    expiresAt: reserveExpiresAt.toISOString(),
  });

  for (const item of items) {
    await paymentsRepo.createCheckoutTransaction({
      ticketTypeId: item.ticketTypeId,
      userId,
      quantity: item.quantity,
      paymentId,
      amountCents: totalAmountCents,
      provider: providerName,
      reserveExpiresAt,
      generateTicketCode,
    });
  }

  return {
    paymentId,
    checkoutUrl: checkoutResult.checkoutUrl,
  };
}

export async function processWebhook(
  payload: unknown,
  headers: Record<string, string>,
  providerName: string,
) {
  const provider = getProvider(providerName);

  if (!provider.verifySignature(payload, headers)) {
    throw Object.assign(new Error('Invalid webhook signature'), {
      statusCode: 400,
      code: 'INVALID_SIGNATURE',
    });
  }

  const event = await provider.parseWebhook(payload);

  const payment = await paymentsRepo.findByReference(event.reference);
  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  if (payment.status !== 'pending') {
    return { received: true };
  }

  if (event.status === 'approved') {
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
    }
  } else if (event.status === 'declined') {
    await paymentsRepo.update(payment.id, { status: 'failed' });
  }

  return { received: true };
}

export async function listMyPayments(userId: string, page: number, limit: number) {
  const [data, total] = await Promise.all([
    paymentsRepo.findAllByUserId(userId, page, limit),
    paymentsRepo.countByUserId(userId),
  ]);

  return { data, total, page, limit };
}

export async function listAllPayments(page: number, limit: number) {
  const [data, total] = await Promise.all([
    paymentsRepo.findAllPayments(page, limit),
    paymentsRepo.countAllPayments(),
  ]);

  return { data, total, page, limit };
}

export async function getPaymentDetail(paymentId: string) {
  const payment = await paymentsRepo.findPaymentByIdWithUser(paymentId);

  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  return payment;
}

export async function getPaymentStatus(paymentId: string, userId: string, userRole: string) {
  const payment = await paymentsRepo.findByIdWithTickets(paymentId);
  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  const isOwner = payment.userId === userId;
  const isStaff = userRole === 'admin' || userRole === 'super_admin';

  if (!isOwner && !isStaff) {
    throw new ForbiddenError('Access denied');
  }

  return {
    id: payment.id,
    status: payment.status,
    amountCents: payment.amountCents,
    provider: payment.provider,
    tickets: payment.tickets.map((t) => ({
      id: t.id,
      ticketCode: t.ticketCode,
      status: t.status,
      qrToken: t.qrToken,
    })),
  };
}
