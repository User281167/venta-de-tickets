import { getEmailProvider } from './channels/channel.registry.js';
import { getWhatsAppProvider } from './channels/whatsapp-provider.registry.js';
import {
  renderTemplate,
  renderTextTemplate,
} from './templates/render-template.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../shared/config/env.js';
import type {
  MessagingClient,
  ConfirmationLinkPayload,
} from './messaging.types.js';

const EVENT_NAME = 'Asociación de Egresados UTP - 2026';

function buildVars(payload: ConfirmationLinkPayload) {
  return {
    frontendUrl: env.CONFIRMATION_LINK_BASE_URL,
    customerName: payload.buyerName,
    eventName: EVENT_NAME,
    ticketId: payload.ticketId,
    qrImageUrl: payload.qrImageUrl,
    confirmationUrl: payload.confirmationUrl,
  };
}

export class ConsoleMessagingClient implements MessagingClient {
  async sendConfirmationLink(payload: ConfirmationLinkPayload): Promise<void> {
    const vars = buildVars(payload);
    const subject = `Confirma tu entrada — ${EVENT_NAME}`;

    if (payload.email) {
      try {
        await getEmailProvider().send(
          payload.email,
          subject,
          renderTemplate('ticket-confirmed', vars),
        );
      } catch (err) {
        logger.error(
          { err: (err as Error).message, ticketId: payload.ticketId },
          '[messaging:client] confirmation email failed',
        );
      }
    }

    if (payload.phone) {
      const text = renderTextTemplate('ticket-confirmed', vars);

      void getWhatsAppProvider()
        .send({
          to: payload.phone,
          text,
          externalId: `confirmation-link:${payload.ticketId}`,
        })
        .catch((err) =>
          logger.error(
            { err: (err as Error).message, ticketId: payload.ticketId },
            '[messaging:client] confirmation whatsapp failed',
          ),
        );
    }
  }
}

export const messagingClient: MessagingClient = new ConsoleMessagingClient();
