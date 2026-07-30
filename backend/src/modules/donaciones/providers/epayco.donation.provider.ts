import crypto from 'crypto';
import { env } from '../../../shared/config/env.js';
import { logger } from '../../../utils/logger.js';
import { apifyAuthService } from '../../payments/providers/epayco/apify-auth.service.js';
import type {
  DonationProvider,
  DonationPreferenceInput,
  DonationPreferenceResult,
  NormalizedDonationWebhookEvent,
  DonationWebhookStatus,
} from './donation-provider.types.js';

const EPAYCO_CHECKOUT_URL = 'https://checkout.epayco.co/checkout-v2/session';

export interface EpaycoDonationConfig {
  providerName: string;
  account: string;
  notificationUrl: string;
}

export class EpaycoDonationProvider implements DonationProvider {
  private config: EpaycoDonationConfig;

  constructor(config: EpaycoDonationConfig) {
    this.config = config;
  }

  getProviderName(): string {
    return this.config.providerName;
  }

  async createPreference(input: DonationPreferenceInput): Promise<DonationPreferenceResult> {
    const token = await apifyAuthService.getToken();

    const response = await fetch(
      'https://apify.epayco.co/payment/session/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          checkout_version: '2',
          name: input.description,
          currency: 'COP',
          amount: input.amountCents,
          response: `${input.backUrl}/epayco-result`,
          confirmation: this.config.notificationUrl,
          extras: {
            extra1: input.externalReference,
          },
          ...(input.payerEmail ? { billing: { email: input.payerEmail } } : {}),
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error(
        `ePayco donation session creation failed: status=${response.status}, body=${errorBody}`,
      );
      throw new Error(
        `ePayco session creation failed with status ${response.status}`,
      );
    }

    const data = (await response.json()) as {
      success?: boolean;
      titleResponse?: string;
      data?: { sessionId?: string; token?: string };
    };

    if (!data.success || !data.data?.sessionId) {
      logger.error(
        `ePayco donation session response missing sessionId: ${JSON.stringify(data)}`,
      );
      throw new Error(
        `Failed to create ePayco donation session: ${data.titleResponse ?? JSON.stringify(data)}`,
      );
    }

    const sessionId = data.data.sessionId;
    const initPoint = `${EPAYCO_CHECKOUT_URL}/${sessionId}`;

    logger.info(
      `ePayco donation session created: sessionId=${sessionId}, externalReference=${input.externalReference}`,
    );

    return {
      initPoint,
      providerTxId: sessionId,
    };
  }

  verifySignature(payload: unknown, _headers: Record<string, string>): boolean {
    const data = payload as Record<string, string>;

    const p_cust_id_cliente = env.EPAYCO_CUST_ID_CLIENTE;
    const p_key = env.EPAYCO_P_KEY;
    const x_ref_payco = data.x_ref_payco ?? '';
    const x_transaction_id = data.x_transaction_id ?? '';
    const x_amount = data.x_amount ?? '';
    const x_currency_code = data.x_currency_code ?? '';
    const x_signature = data.x_signature ?? '';

    const signatureString = `${p_cust_id_cliente}^${p_key}^${x_ref_payco}^${x_transaction_id}^${x_amount}^${x_currency_code}`;

    const computed = crypto
      .createHash('sha256')
      .update(signatureString)
      .digest('hex');

    if (computed !== x_signature) {
      logger.warn('ePayco donation webhook signature verification failed');
      return false;
    }

    logger.info('ePayco donation webhook signature verified');
    return true;
  }

  async parseWebhook(payload: unknown): Promise<NormalizedDonationWebhookEvent> {
    const data = payload as Record<string, string>;

    const xResponse = data.x_response ?? '';

    let status: DonationWebhookStatus;
    switch (xResponse) {
      case 'Aceptada':
        status = 'approved';
        break;
      case 'Rechazada':
      case 'Fallida':
        status = 'declined';
        break;
      case 'Pendiente':
        status = 'pending';
        break;
      default:
        status = 'pending';
    }

    logger.info(
      `Parsed ePayco donation webhook: refPayco=${data.x_ref_payco ?? ''}, status=${status}, transactionId=${data.x_transaction_id ?? ''}`,
    );

    return {
      reference: data.x_extra1 ?? '',
      status,
      externalId: data.x_transaction_id ?? '',
      rawPayload: payload,
    };
  }
}
