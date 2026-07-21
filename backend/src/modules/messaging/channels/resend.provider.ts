import { Resend } from 'resend';
import type { EmailProvider } from './email-provider.interface.js';
import { env } from '../../../shared/config/env.js';
import { logger } from '../../../utils/logger.js';

export class ResendProvider implements EmailProvider {
  private client: Resend;

  constructor() {
    this.client = new Resend(env.RESEND_API_KEY);
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    try {
      const { error } = await this.client.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
      });

      if (error) {
        logger.error(
          { to, subject, error: error.message },
          '[messaging:resend] send failed',
        );
      }
    } catch (err) {
      logger.error(
        { to, subject, err: (err as Error).message },
        '[messaging:resend] send threw',
      );
    }
  }
}
