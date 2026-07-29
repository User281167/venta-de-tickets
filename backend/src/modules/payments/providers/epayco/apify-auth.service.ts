import { env } from '../../../../shared/config/env.js';
import { logger } from '../../../../utils/logger.js';

interface ApifyAuthState {
  token: string;
  expiresAt: number;
}

class ApifyAuthService {
  private authState: ApifyAuthState | null = null;

  async getToken(): Promise<string> {
    if (this.authState && Date.now() < this.authState.expiresAt) {
      return this.authState.token;
    }

    return this.login();
  }

  private async login(): Promise<string> {
    const credentials = Buffer.from(
      `${env.EPAYCO_PUBLIC_KEY}:${env.EPAYCO_PRIVATE_KEY}`,
    ).toString('base64');

    logger.info('Authenticating with ePayco Apify API');

    const response = await fetch('https://apify.epayco.co/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${credentials}`,
      },
    });

    if (!response.ok) {
      logger.error(`Apify login failed: status=${response.status}`);
      throw new Error(`Apify login failed with status ${response.status}`);
    }

    const data = (await response.json()) as { token?: string };

    if (!data.token) {
      logger.error('Apify login response missing token');
      throw new Error('Apify login response missing token');
    }

    const payload = JSON.parse(
      Buffer.from(data.token.split('.')[1], 'base64').toString(),
    ) as { exp?: number };

    const expiresAt = payload.exp
      ? payload.exp * 1000
      : Date.now() + 20 * 60 * 1000;

    this.authState = { token: data.token, expiresAt };

    logger.info(
      `Apify authentication successful, token expires at ${new Date(expiresAt).toISOString()}`,
    );

    return data.token;
  }
}

export const apifyAuthService = new ApifyAuthService();
