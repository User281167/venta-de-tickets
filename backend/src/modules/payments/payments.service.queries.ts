import { logger } from '../../utils/logger.js';
import { ForbiddenError } from '../../shared/errors/ForbiddenError.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import * as paymentsRepo from './payments.repository.js';

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

export async function getPaymentForNotification(paymentId: string) {
  return paymentsRepo.findByIdWithUserAndTickets(paymentId);
}

// Estado de un pago para el dueño o staff (admin/super_admin). Filtra
// los campos sensibles al rol antes de devolver.
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
    provider: payment.provider,
    tickets: payment.tickets.map((t) => ({
      id: t.id,
      ticketCode: t.ticketCode,
      status: t.status,
      qrToken: t.qrToken,
    })),
  };
}
