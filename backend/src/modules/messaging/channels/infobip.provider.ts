// src/modules/messaging/providers/infobip.provider.ts

import { Client, SendSmsRequest } from '@infobip-api/sdk';
import type {
  WhatsAppMessage,
  WhatsAppProvider,
} from './whatsapp-provider.interface.js';
import { env } from '../../../shared/config/env.js';
import { logger } from '../../../utils/logger.js';

export class InfobipProvider implements WhatsAppProvider {
  private client: Client;
  private senderId: string;

  constructor() {
    this.client = new Client({
      apiKey: env.INFOBIP_API_KEY,
      baseUrl: env.INFOBIP_BASE_URL, // https://api.infobip.com
    });
    this.senderId = env.INFOBIP_SENDER_ID; // "La Convención"
  }

  async send(message: WhatsAppMessage): Promise<{ messageId: string }> {
    try {
      const request: SendSmsRequest = {
        messages: [
          {
            destinations: [{ to: message.to }],
            from: this.senderId,
            text: this.buildTemplateText(message),
            externalId: message.externalId,
            type: 'WHATSAPP',
          },
        ],
      };

      const response = await this.client.sms.send(request);

      if (!response?.messages?.[0]?.messageId) {
        throw new Error('No messageId in Infobip response');
      }

      logger.info(
        {
          to: message.to,
          template: message.template.name,
          messageId: response.messages[0].messageId,
          externalId: message.externalId,
        },
        '[messaging:infobip] send success',
      );

      return { messageId: response.messages[0].messageId };
    } catch (err) {
      logger.error(
        {
          to: message.to,
          template: message.template.name,
          externalId: message.externalId,
          error: (err as Error).message,
        },
        '[messaging:infobip] send failed',
      );
      throw err;
    }
  }

  /**
   * Construye texto del template con placeholders
   * Infobip no soporta "templates" como Meta, envía texto directo
   */
  private buildTemplateText(message: WhatsAppMessage): string {
    const templates: Record<string, string> = {
      ticket_confirmation: this.buildTicketConfirmation(
        message.template.parameters,
      ),

      payment_receipt: this.buildPaymentReceipt(message.template.parameters),
      reminder_24h: this.buildReminder24h(message.template.parameters),
    };

    const text = templates[message.template.name];
    if (!text) {
      throw new Error(`Unknown template: ${message.template.name}`);
    }

    return text;
  }

  private buildTicketConfirmation(params?: string[]): string {
    const [firstName, zone, date] = params || ['Usuario', 'General', 'TBD'];
    return `Hola ${firstName},\n\nTu entrada a La Convención UTP 2026 está confirmada.\n\n🎫 Zona: ${zone}\n📍 ${date}\n\nGracias por tu asistencia.`;
  }

  private buildPaymentReceipt(params?: string[]): string {
    const [firstName, amount] = params || ['Usuario', '$0'];
    return `Hola ${firstName},\n\nTu pago de ${amount} COP ha sido procesado correctamente.\n\nGracias.`;
  }

  private buildReminder24h(params?: string[]): string {
    const [firstName] = params || ['Usuario'];
    return `Hola ${firstName},\n\n¡Recordatorio! La Convención es mañana a las 10 AM.\n\n¿Confirmás tu asistencia? Responde Sí o No.`;
  }
}
