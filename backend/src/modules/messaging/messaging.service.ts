import { getEmailProvider } from './channels/channel.registry.js';
import { renderTemplate } from './templates/render-template.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../shared/config/env.js';

const EVENT_NAME = 'La Convención De Egresados UTP 2026';

function formatCop(cents: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(cents);
}

function formatDate(value: Date | string): string {
  const d = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export async function sendPaymentConfirmation(input: {
  customerName: string;
  customerEmail: string;
  totalCents: number;
  paidAt: Date;
}): Promise<void> {
  const html = renderTemplate('payment-confirmed', {
    frontendUrl: env.CONFIRMATION_LINK_BASE_URL,
    customerName: input.customerName,
    amount: formatCop(input.totalCents),
    eventName: EVENT_NAME,
    paymentDate: formatDate(input.paidAt),
  });

  await getEmailProvider().send(
    input.customerEmail,
    `Pago confirmado — ${EVENT_NAME}`,
    html,
  );
}

export async function sendPaymentFailed(input: {
  customerName: string;
  customerEmail: string;
  totalCents: number;
  failedAt: Date;
  reason?: string;
}): Promise<void> {
  const reason = input.reason ?? 'El proveedor de pagos rechazó la transacción.';

  const html = renderTemplate('payment-failed', {
    frontendUrl: env.CONFIRMATION_LINK_BASE_URL,
    customerName: input.customerName,
    reason,
    eventName: EVENT_NAME,
    amount: formatCop(input.totalCents),
    paymentDate: formatDate(input.failedAt),
  });

  await getEmailProvider().send(
    input.customerEmail,
    `Pago no procesado — ${EVENT_NAME}`,
    html,
  );
}

export async function sendPaymentUnfulfillable(input: {
  customerName: string;
  customerEmail: string;
  totalCents: number;
  paymentId: string;
  occurredAt: Date;
}): Promise<void> {
  const html = renderTemplate('payment-unfulfillable', {
    frontendUrl: env.CONFIRMATION_LINK_BASE_URL,
    customerName: input.customerName,
    amount: formatCop(input.totalCents),
    eventName: EVENT_NAME,
    paymentId: input.paymentId,
    paymentDate: formatDate(input.occurredAt),
  });

  await getEmailProvider().send(
    input.customerEmail,
    `Reembolso en proceso — ${EVENT_NAME}`,
    html,
  );
}

export async function sendPaymentRefunded(input: {
  customerName: string;
  customerEmail: string;
  totalCents: number;
  paymentId: string;
  reason: string;
  refundedAt: Date;
}): Promise<void> {
  const html = renderTemplate('payment-refunded', {
    frontendUrl: env.CONFIRMATION_LINK_BASE_URL,
    customerName: input.customerName,
    amount: formatCop(input.totalCents),
    eventName: EVENT_NAME,
    paymentId: input.paymentId,
    reason: input.reason,
    refundDate: formatDate(input.refundedAt),
  });

  await getEmailProvider().send(
    input.customerEmail,
    `Reembolso confirmado — ${EVENT_NAME}`,
    html,
  );
}

export async function sendTicketConfirmation(input: {
  customerName: string;
  customerEmail: string;
  ticketId: string;
  qrImageUrl: string;
  confirmationUrl: string;
}): Promise<void> {
  const html = renderTemplate('ticket-confirmed', {
    frontendUrl: env.CONFIRMATION_LINK_BASE_URL,
    customerName: input.customerName,
    eventName: EVENT_NAME,
    ticketId: input.ticketId,
    qrImageUrl: input.qrImageUrl,
    confirmationUrl: input.confirmationUrl,
  });

  await getEmailProvider().send(
    input.customerEmail,
    `Confirma tu entrada — ${EVENT_NAME}`,
    html,
  );
}

export async function sendTicketPaid(input: {
  customerName: string;
  customerEmail: string;
  ticketId: string;
  ticketCode: string;
  ticketName?: string;
  qrPngBuffer: Buffer;
}): Promise<void> {
  const html = renderTemplate('ticket-paid', {
    frontendUrl: env.CONFIRMATION_LINK_BASE_URL,
    customerName: input.customerName,
    eventName: EVENT_NAME,
    ticketId: input.ticketId,
    ticketCode: input.ticketCode,
    ticketName: input.ticketName ?? '',
  });

  await getEmailProvider().send(
    input.customerEmail,
    `Tu entrada está lista — ${EVENT_NAME}`,
    html,
    [
      {
        filename: 'ticket-qr.png',
        content: input.qrPngBuffer,
        contentType: 'image/png',
        contentId: 'ticket-qr',
      },
    ],
  );
}

export async function sendTicketCancellation(input: {
  customerName: string;
  customerEmail: string;
  ticketId: string;
}): Promise<void> {
  const html = renderTemplate('ticket-cancelled', {
    frontendUrl: env.CONFIRMATION_LINK_BASE_URL,
    customerName: input.customerName,
    eventName: EVENT_NAME,
    ticketId: input.ticketId,
  });

  await getEmailProvider().send(
    input.customerEmail,
    `Entrada cancelada — ${EVENT_NAME}`,
    html,
  );
}

function donationAccountName(account: string): string {
  return account === 'LA_CONVENCION' ? 'La Convención' : 'Barranqueros UTP';
}

export async function sendDonationConfirmation(input: {
  donorName: string;
  donorEmail: string;
  amountCents: number;
  account: string;
  confirmedAt: Date;
}): Promise<void> {
  const html = renderTemplate('donation-confirmed', {
    frontendUrl: env.CONFIRMATION_LINK_BASE_URL,
    donorName: input.donorName,
    amount: formatCop(input.amountCents),
    eventName: EVENT_NAME,
    accountName: donationAccountName(input.account),
    donationDate: formatDate(input.confirmedAt),
  });

  await getEmailProvider().send(
    input.donorEmail,
    `Donación confirmada — ${EVENT_NAME}`,
    html,
  );
}

export async function sendDonationRejection(input: {
  donorName: string;
  donorEmail: string;
  amountCents: number;
  account: string;
  rejectedAt: Date;
}): Promise<void> {
  const html = renderTemplate('donation-rejected', {
    frontendUrl: env.CONFIRMATION_LINK_BASE_URL,
    donorName: input.donorName,
    amount: formatCop(input.amountCents),
    eventName: EVENT_NAME,
    accountName: donationAccountName(input.account),
    donationDate: formatDate(input.rejectedAt),
  });

  await getEmailProvider().send(
    input.donorEmail,
    `No pudimos procesar tu donación — ${EVENT_NAME}`,
    html,
  );
}

export async function sendDonationCancellation(input: {
  donorName: string;
  donorEmail: string;
  amountCents: number;
  account: string;
  cancelledAt: Date;
}): Promise<void> {
  const html = renderTemplate('donation-cancelled', {
    frontendUrl: env.CONFIRMATION_LINK_BASE_URL,
    donorName: input.donorName,
    amount: formatCop(input.amountCents),
    eventName: EVENT_NAME,
    accountName: donationAccountName(input.account),
    donationDate: formatDate(input.cancelledAt),
  });

  await getEmailProvider().send(
    input.donorEmail,
    `Tu donación expiró — ${EVENT_NAME}`,
    html,
  );
}

export const messagingService = {
  sendPaymentConfirmation,
  sendPaymentFailed,
  sendPaymentUnfulfillable,
  sendPaymentRefunded,
  sendTicketConfirmation,
  sendTicketPaid,
  sendTicketCancellation,
  sendDonationConfirmation,
  sendDonationRejection,
  sendDonationCancellation,
};

logger.info('[messaging] service initialized');
