import {
  MercadoPagoConfig,
  Preference,
  Payment,
  WebhookSignatureValidator,
} from 'mercadopago';
import type {
  DonationProvider,
  DonationPreferenceInput,
  DonationPreferenceResult,
  NormalizedDonationWebhookEvent,
  DonationWebhookStatus,
} from './donation-provider.types.js';
import { createDonationUUID } from '../donaciones.repository.js';

export interface MercadoPagoDonationConfig {
  accessToken: string;
  webhookSecret: string;
  providerName?: string;
  notificationUrl: string;
}

export class MercadoPagoDonationProvider implements DonationProvider {
  private client: MercadoPagoConfig;
  private config: MercadoPagoDonationConfig;

  constructor(config: MercadoPagoDonationConfig) {
    this.config = config;
    this.client = new MercadoPagoConfig({
      accessToken: config.accessToken,
    });
  }

  getProviderName(): string {
    return this.config.providerName ?? 'mercadopago-donation';
  }

  async createPreference(input: DonationPreferenceInput): Promise<DonationPreferenceResult> {
    const preferenceClient = new Preference(this.client);

    const result = await preferenceClient.create({
      body: {
        items: [
          {
            id: createDonationUUID(),
            title: input.description,
            quantity: 1,
            unit_price: input.amountCents,
          },
        ],
        external_reference: input.externalReference,
        back_urls: {
          success: `${input.backUrl}/state/success`,
          failure: `${input.backUrl}/state/failure`,
          pending: `${input.backUrl}/state/pending`,
        },
        notification_url: this.config.notificationUrl,
        payer: input.payerEmail ? { email: input.payerEmail } : undefined,
      },
    });

    return {
      initPoint: result.init_point!,
      providerTxId: result.id!.toString(),
    };
  }

  verifySignature(payload: unknown, headers: Record<string, string>): boolean {
    try {
      const body = payload as { data?: { id?: string } };
      const dataId = body?.data?.id ?? '';

      WebhookSignatureValidator.validate({
        xSignature: headers['x-signature'],
        xRequestId: headers['x-request-id'],
        dataId,
        secret: this.config.webhookSecret,
      });

      return true;
    } catch {
      return false;
    }
  }

  async parseWebhook(payload: unknown): Promise<NormalizedDonationWebhookEvent> {
    const body = payload as {
      type?: string;
      action?: string;
      data?: { id?: string | number };
    };

    if (body.type !== 'payment' || !body.data?.id) {
      throw new Error('Invalid webhook payload: expected payment type with data.id');
    }

    const paymentClient = new Payment(this.client);
    const mpPayment = await paymentClient.get({ id: body.data.id });
    const status = this.normalizeStatus(mpPayment.status ?? '');

    return {
      reference: mpPayment.external_reference ?? '',
      status,
      externalId: String(mpPayment.id),
      rawPayload: payload,
    };
  }

  private normalizeStatus(mpStatus: string): DonationWebhookStatus {
    switch (mpStatus) {
      case 'approved':
        return 'approved';
      case 'rejected':
      case 'cancelled':
      case 'refunded':
      case 'chargeback':
        return 'declined';
      default:
        return 'pending';
    }
  }
}
