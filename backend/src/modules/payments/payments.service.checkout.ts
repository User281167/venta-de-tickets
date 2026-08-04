import { randomBytes, randomUUID } from 'crypto';

import { logger } from '../../utils/logger.js';
import { ValidationError } from '../../shared/errors/ValidationError.js';
import {
  RESERVATION_EXPIRATION_INTERNAL_MILLIS,
  RESERVATION_EXPIRATION_PROVIDER_MILLIS,
} from '../../shared/config/constants.js';
import * as ticketsService from '../tickets/tickets.service.js';
import * as paymentsRepo from './payments.repository.js';
import { findByUserId, findEgresadoFlag } from '../me/me.repository.js';
import { getProvider } from './providers/provider.registry.js';

export function generateTicketCode(): string {
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
    throw new ValidationError('USER_INFO_INCOMPLETE', 'User info incomplete', {
      missingFields,
    });
  }

  const egresadoRow = await findEgresadoFlag(userId);
  const userEgresado = egresadoRow?.egresado ?? false;

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

    // precio ya en cents desde ticket_types
    const unitPriceCents = Number(ticketType.priceCents);
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

  const reserveProviderExpiresAt = new Date(
    Date.now() + RESERVATION_EXPIRATION_PROVIDER_MILLIS,
  );
  const reserveExpiresAt = new Date(
    Date.now() + RESERVATION_EXPIRATION_INTERNAL_MILLIS,
  );
  const paymentId = randomUUID();

  // 1. DB primero: reserva atómica de TODO el checkout
  await paymentsRepo.createCheckoutReservation({
    paymentId,
    userId,
    provider: providerName,
    subtotalCents,
    totalCents: subtotalCents,
    reserveExpiresAt,
    userEgresado,
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
    ...(checkoutResult.sessionId
      ? { sessionId: checkoutResult.sessionId }
      : {}),
  };
}
