import { logger } from '../../utils/logger.js';
import type { MessagingClient, ConfirmationLinkPayload } from './messaging.types.js';

export class ConsoleMessagingClient implements MessagingClient {
  async sendConfirmationLink(payload: ConfirmationLinkPayload): Promise<void> {
    logger.info(
      `[messaging:stub] would send ${payload.channel} to ${payload.buyerContact} for ticket ${payload.ticketId}`,
    );
  }
}

export const messagingClient: MessagingClient = new ConsoleMessagingClient();
