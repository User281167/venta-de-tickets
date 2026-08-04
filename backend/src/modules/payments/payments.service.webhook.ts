import { logger } from '../../utils/logger.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import * as ticketsService from '../tickets/tickets.service.js';
import * as paymentsRepo from './payments.repository.js';
import { getProvider } from './providers/provider.registry.js';
import {
  notifyPaymentConfirmed,
  notifyPaymentFailed,
  notifyPaymentUnfulfillable,
} from '../messaging/notifications/payment-notifications.js';
import * as auditService from '../audit/audit.service.js';
import {
  EVENT_ID,
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from '../audit/audit.constants.js';

// Despacha el resultado de un reclaim (failed|expired → completed) a las
// acciones posteriores: QR por ticket, auditoría, notificación.
async function finalizeReclaim(
  paymentId: string,
  ticketIds: string[],
  providerName: string,
  previousState: 'fallo' | 'expirado',
  outcome: 'reclaimed' | 'unfulfillable',
  totalCents: number,
  providerTxId: string,
  metadata: unknown,
): Promise<void> {
  if (outcome === 'reclaimed') {
    for (const ticketId of ticketIds) {
      await ticketsService.generateQrForTicket(ticketId);
    }
  } else {
    // Marca el pago como 'completed_unfulfillable' para que no entre en un
    // bucle de reclamo si llega otra webhook del mismo txn.
    await paymentsRepo.markUnfulfillable(
      paymentId,
      providerTxId,
      metadata as any,
    );
  }

  await auditService.log({
    eventId: EVENT_ID,
    actorId: 'system:webhook',
    action: AUDIT_ACTIONS.PAGO_ESTADO_CAMBIADO,
    entityType: AUDIT_ENTITY_TYPES.PAGOS,
    entityId: paymentId,
    metadata: {
      'Proveedor': providerName,
      'Estado Anterior': previousState,
      'Estado Nuevo':
        outcome === 'reclaimed'
          ? 'completado'
          : 'Completado sin disponibilidad',
      'Total Centavos': totalCents,
    },
  });

  if (outcome === 'reclaimed') {
    void notifyPaymentConfirmed(paymentId);
  } else {
    void notifyPaymentUnfulfillable(paymentId);
  }
}

// Máquina de estados del webhook de pago. Las firmas del proveedor ya fueron
// verificadas por el middleware; aquí se confía en el payload y se enruta
// según el estado actual del pago en DB.
export async function processWebhook(
  payload: unknown,
  _headers: Record<string, string>,
  providerName: string,
) {
  logger.info(`Processing webhook: providerName=${providerName}`);
  const provider = getProvider(providerName);

  const event = await provider.parseWebhook(payload);
  const payment = await paymentsRepo.findByReference(event.reference);

  if (!payment) {
    logger.warn(`Payment not found: reference=${event.reference}`);
    throw new NotFoundError('Payment not found');
  }

  // Estado terminal idempotente: ya se procesó antes (reintento normal de
  // proveedor) o quedó cerrado por otra vía.
  if (payment.status === 'completed') {
    logger.info(`Payment already completed: paymentId=${payment.id}`);
    return { received: true };
  }

  if (payment.status === 'completed_unfulfillable') {
    if (event.status === 'approved') {
      logger.warn(
        `Late approval on unfulfillable payment: paymentId=${payment.id}, externalId=${event.externalId}`,
      );
    }

    return { received: true };
  }

  // Reclamo de un pago que el proveedor rechazó pero el cliente reintenta.
  if (payment.status === 'failed') {
    if (event.status !== 'approved') {
      return { received: true };
    }

    const result = await paymentsRepo.reclaimFailedPayment({
      paymentId: payment.id,
      providerTxId: event.externalId,
      metadata: event.rawPayload as any,
    });

    if (result.outcome === 'already_processed') {
      logger.info(
        `Reclaim already processed by concurrent webhook: paymentId=${payment.id}`,
      );
      return { received: true };
    }

    if (result.outcome === 'reclaimed') {
      logger.info(
        `Reclaimed failed payment: paymentId=${payment.id}, tickets=${result.ticketIds.length}`,
      );
    } else {
      logger.warn(
        `Payment unfulfillable (sold out on reclaim): paymentId=${payment.id}`,
      );
    }

    await finalizeReclaim(
      payment.id,
      result.outcome === 'reclaimed' ? result.ticketIds : [],
      providerName,
      'fallo',
      result.outcome,
      Number(payment.totalCents),
      event.externalId,
      event.rawPayload,
    );

    return { received: true };
  }

  // Reclamo de un pago barrido a 'expired' antes de que llegara el webhook.
  if (payment.status === 'expired') {
    if (event.status !== 'approved') {
      logger.info(
        `Declined/other event on expired payment: paymentId=${payment.id}`,
      );
      return { received: true };
    }

    const result = await paymentsRepo.reclaimExpiredPayment({
      paymentId: payment.id,
      providerTxId: event.externalId,
      metadata: event.rawPayload as any,
    });

    if (result.outcome === 'already_processed') {
      logger.info(
        `Reclaim already processed by concurrent webhook: paymentId=${payment.id}`,
      );
      return { received: true };
    }

    if (result.outcome === 'reclaimed') {
      logger.info(
        `Reclaimed expired payment: paymentId=${payment.id}, tickets=${result.ticketIds.length}`,
      );
    } else {
      logger.warn(
        `Payment unfulfillable (sold out on reclaim): paymentId=${payment.id}`,
      );
    }

    await finalizeReclaim(
      payment.id,
      result.outcome === 'reclaimed' ? result.ticketIds : [],
      providerName,
      'expirado',
      result.outcome,
      Number(payment.totalCents),
      event.externalId,
      event.rawPayload,
    );

    return { received: true };
  }

  // Flujo normal: payment sigue pending.
  if (event.status === 'approved') {
    logger.info(
      `Approved payment: paymentId=${payment.id}, externalId=${event.externalId}`,
    );

    const result = await paymentsRepo.processPaymentWebhook({
      paymentId: payment.id,
      providerTxId: event.externalId,
      metadata: event.rawPayload as any,
    });

    if (!result.processed) {
      return { received: true };
    }

    const paymentWithTickets = await paymentsRepo.findByIdWithTickets(
      payment.id,
    );

    if (paymentWithTickets) {
      for (const ticket of paymentWithTickets.tickets) {
        await ticketsService.generateQrForTicket(ticket.id);
      }
    }

    await auditService.log({
      eventId: EVENT_ID,
      actorId: 'system:webhook',
      action: AUDIT_ACTIONS.PAGO_ESTADO_CAMBIADO,
      entityType: AUDIT_ENTITY_TYPES.PAGOS,
      entityId: payment.id,
      metadata: {
        'Proveedor': providerName,
        'Estado Anterior': 'pendiente',
        'Estado Nuevo': 'completado',
        'Total Centavos': payment.totalCents,
      },
    });

    void notifyPaymentConfirmed(payment.id);
    logger.info(
      `Processed payment: paymentId=${payment.id}, externalId=${event.externalId}`,
    );
  } else if (event.status === 'declined') {
    logger.info(
      `Declined payment: paymentId=${payment.id}, externalId=${event.externalId}`,
    );
    await paymentsRepo.update(payment.id, { status: 'failed' });

    await auditService.log({
      eventId: EVENT_ID,
      actorId: 'system:webhook',
      action: AUDIT_ACTIONS.PAGO_ESTADO_CAMBIADO,
      entityType: AUDIT_ENTITY_TYPES.PAGOS,
      entityId: payment.id,
      metadata: {
        'Proveedor': providerName,
        'Estado Anterior': 'pendiente',
        'Estado Nuevo': 'fallo',
        'Total Centavos': payment.totalCents,
      },
    });

    void notifyPaymentFailed(
      payment.id,
      'El proveedor de pagos rechazó la transacción.',
    );
  }

  return { received: true };
}
