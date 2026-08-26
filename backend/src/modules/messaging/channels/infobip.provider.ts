import type {
  WhatsAppMessage,
  WhatsAppProvider,
} from './whatsapp-provider.interface.js';
import { env } from '../../../shared/config/env.js';
import { logger } from '../../../utils/logger.js';

// La obtención nativa evita los cambios constantes en la API de @infobip-api/sdk (cliente v0.1 frente a Infobip v0.3).
// Infobip SMS endpoint with type=WHATSAPP routes a free-form text message to WhatsApp.
export class InfobipProvider implements WhatsAppProvider {
  private baseUrl: string;
  private apiKey: string;
  private senderId: string;

  constructor() {
    this.baseUrl = env.INFOBIP_BASE_URL.replace(/\/+$/, '');
    this.apiKey = env.INFOBIP_API_KEY;
    this.senderId = env.INFOBIP_SENDER_ID;
  }

  async send(message: WhatsAppMessage): Promise<{ messageId: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/sms/2/text/advanced`, {
        method: 'POST',
        headers: {
          Authorization: `App ${this.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              destinations: [{ to: message.to }],
              from: this.senderId,
              text: message.text,
              type: 'WHATSAPP',
            },
          ],
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(
          `Infobip send failed: ${response.status} ${response.statusText} ${body}`,
        );
      }

      const data = (await response.json()) as {
        messages?: Array<{ messageId?: string }>;
      };
      const messageId = data.messages?.[0]?.messageId;

      if (!messageId) {
        throw new Error('No messageId in Infobip response');
      }

      logger.info(
        {
          to: message.to,
          externalId: message.externalId,
          messageId,
        },
        '[messaging:infobip] send success',
      );

      return { messageId };
    } catch (err) {
      logger.error(
        {
          to: message.to,
          externalId: message.externalId,
          error: (err as Error).message,
        },
        '[messaging:infobip] send failed',
      );
      throw err;
    }
  }
}
