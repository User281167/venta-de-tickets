import { logger } from '../../utils/logger.js';
import * as ticketsService from '../tickets/tickets.service.js';
import * as paymentsRepo from './payments.repository.js';
import {
  notifyPaymentConfirmed,
  notifyPaymentRefunded,
} from '../messaging/notifications/payment-notifications.js';
import * as auditService from '../audit/audit.service.js';
import {
  EVENT_ID,
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from '../audit/audit.constants.js';
import { generateTicketCode } from './payments.service.checkout.js';

// Pago manual o regalo hecho por un admin: bypasea proveedor externo, salta
// la validación de 'enabled' y permite crear tickets sin pasar por checkout.
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

    const unitPriceCents = Number(ticketType.priceCents);
    subtotalCents += unitPriceCents * item.quantity;
    ticketsWithPrice.push({ ...item, unitPriceCents });
  }

  const result = await paymentsRepo.createAdminPaymentTransaction({
    userId: input.userId,
    provider: input.provider,
    subtotalCents,
    totalCents: subtotalCents,
    createdBy: input.createdBy,
    tickets: ticketsWithPrice,
    generateTicketCode,
  });

  for (const ticketId of result.ticketIds) {
    await ticketsService.generateQrForTicket(ticketId);
  }

  await auditService.log({
    eventId: EVENT_ID,
    actorId: input.createdBy,
    action: AUDIT_ACTIONS.ADMIN_CREO_PAGO_MANUAL,
    entityType: AUDIT_ENTITY_TYPES.PAGOS,
    entityId: result.paymentId,
    metadata: {
      Proveedor: input.provider,
      'Estado Anterior': 'none',
      'Estado Nuevo': 'completed',
      'Total Centavos': subtotalCents,
    },
  });

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
  logger.info(
    `Processing refund: paymentId=${input.paymentId} reason=${input.reason} processedById=${input.processedById}`,
  );

  const cancelledTickets = await paymentsRepo.findCancellableTicketsByPayment(
    input.paymentId,
  );

  const refund = await paymentsRepo.refundTransaction(input);

  await auditService.log({
    eventId: EVENT_ID,
    actorId: input.processedById,
    action: AUDIT_ACTIONS.PAGO_ESTADO_CAMBIADO,
    entityType: AUDIT_ENTITY_TYPES.PAGOS,
    entityId: input.paymentId,
    metadata: {
      'Razon': input.reason,
      'Estado Anterior': 'completed',
      'Estado Nuevo': 'refunded',
    },
  });

  for (const ticket of cancelledTickets) {
    await auditService.log({
      eventId: EVENT_ID,
      actorId: input.processedById,
      action: AUDIT_ACTIONS.ENTRADA_CANCELADA,
      entityType: AUDIT_ENTITY_TYPES.ENTRADA,
      entityId: ticket.id,
      metadata: {
        'Estado Anterior': ticket.status,
        'Estado Nuevo': 'cancelled',
      },
    });
  }

  void notifyPaymentRefunded({
    paymentId: input.paymentId,
    reason: input.reason,
  });

  logger.info(
    `Refund processed: paymentId=${input.paymentId}, status=${refund.status}`,
  );

  return refund;
}
