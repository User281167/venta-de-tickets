import { prisma } from '../../../shared/database/prisma.client.js';
import { logger } from '../../../utils/logger.js';
import { messagingService } from '../messaging.service.js';

async function findPaymentWithUser(paymentId: string) {
  return prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      user: { select: { id: true, email: true, fullName: true } },
    },
  });
}

export async function notifyPaymentConfirmed(paymentId: string): Promise<void> {
  try {
    const payment = await findPaymentWithUser(paymentId);
    if (!payment || !payment.user) {
      logger.warn(
        `Cannot send payment confirmation email: paymentId=${paymentId} or user missing`,
      );
      return;
    }

    await messagingService.sendPaymentConfirmation({
      customerName: payment.user.fullName,
      customerEmail: payment.user.email,
      totalCents: payment.totalCents,
      paidAt: payment.updatedAt,
    });
  } catch (err) {
    logger.error(
      { err: (err as Error).message, paymentId },
      '[messaging:notify] payment confirmation dispatch failed',
    );
  }
}

export async function notifyPaymentFailed(
  paymentId: string,
  reason: string,
): Promise<void> {
  try {
    const payment = await findPaymentWithUser(paymentId);
    if (!payment || !payment.user) {
      logger.warn(
        `Cannot send payment failed email: paymentId=${paymentId} or user missing`,
      );
      return;
    }

    await messagingService.sendPaymentFailed({
      customerName: payment.user.fullName,
      customerEmail: payment.user.email,
      totalCents: payment.totalCents,
      failedAt: payment.updatedAt,
      reason,
    });
  } catch (err) {
    logger.error(
      { err: (err as Error).message, paymentId },
      '[messaging:notify] payment failed dispatch failed',
    );
  }
}

export async function notifyPaymentUnfulfillable(
  paymentId: string,
): Promise<void> {
  try {
    const payment = await findPaymentWithUser(paymentId);
    if (!payment || !payment.user) {
      logger.warn(
        `Cannot send unfulfillable email: paymentId=${paymentId} or user missing`,
      );
      return;
    }

    await messagingService.sendPaymentUnfulfillable({
      customerName: payment.user.fullName,
      customerEmail: payment.user.email,
      totalCents: payment.totalCents,
      paymentId: payment.id,
      occurredAt: payment.updatedAt,
    });
  } catch (err) {
    logger.error(
      { err: (err as Error).message, paymentId },
      '[messaging:notify] unfulfillable dispatch failed',
    );
  }
}

export async function notifyPaymentRefunded(input: {
  paymentId: string;
  reason: string;
}): Promise<void> {
  try {
    const payment = await findPaymentWithUser(input.paymentId);
    if (!payment || !payment.user) {
      logger.warn(
        `Cannot send refund email: paymentId=${input.paymentId} or user missing`,
      );
      return;
    }

    await messagingService.sendPaymentRefunded({
      customerName: payment.user.fullName,
      customerEmail: payment.user.email,
      totalCents: payment.totalCents,
      paymentId: payment.id,
      reason: input.reason,
      refundedAt: payment.updatedAt,
    });
  } catch (err) {
    logger.error(
      { err: (err as Error).message, paymentId: input.paymentId },
      '[messaging:notify] refund dispatch failed',
    );
  }
}

export async function notifyTicketConfirmation(input: {
  ticketId: string;
  customerName: string;
  customerEmail: string;
  qrImageUrl: string;
  confirmationUrl: string;
}): Promise<void> {
  try {
    await messagingService.sendTicketConfirmation(input);
  } catch (err) {
    logger.error(
      { err: (err as Error).message, ticketId: input.ticketId },
      '[messaging:notify] ticket confirmation dispatch failed',
    );
  }
}
