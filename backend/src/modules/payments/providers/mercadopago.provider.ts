import {
  MercadoPagoConfig,
  Preference,
  Payment,
  WebhookSignatureValidator,
} from 'mercadopago';
import type {
  CheckoutInput,
  CheckoutResult,
  NormalizedWebhookEvent,
  PaymentProvider,
  PaymentWebhookStatus,
} from '../payments.types.js';
import { env } from '../../../shared/config/env.js';

export class MercadoPagoProvider implements PaymentProvider {
  private client: MercadoPagoConfig;

  constructor() {
    this.client = new MercadoPagoConfig({
      accessToken: env.MERCADOPAGO_ACCESS_TOKEN,
    });
  }

  getProviderName(): string {
    return 'mercadopago';
  }

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const preferenceClient = new Preference(this.client);

    const result = await preferenceClient.create({
      body: {
        items: input.items.map((item) => ({
          id: item.ticketTypeId,
          title: item.name,
          quantity: item.quantity,
          unit_price: Math.round(item.unitPriceCents / 100),
        })),
        external_reference: input.externalReference,
        back_urls: {
          success: input.backUrl,
          failure: input.backUrl,
          pending: input.backUrl,
        },
        auto_return: 'approved',
        notification_url: `${env.API_URL}/api/payments/webhook`,
        payer: {
          email: input.payerEmail ?? '',
        },
        date_of_expiration: input.expiresAt,
      },
    });

    return {
      checkoutUrl: result.init_point!,
      providerTxId: result.id!,
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
        secret: env.MERCADOPAGO_WEBHOOK_SECRET,
      });

      return true;
    } catch {
      return false;
    }
  }

  async parseWebhook(payload: unknown): Promise<NormalizedWebhookEvent> {
    const body = payload as {
      type?: string;
      action?: string;
      data?: { id?: string | number };
    };

    if (body.type !== 'payment' || !body.data?.id) {
      throw new Error(
        'Invalid webhook payload: expected payment type with data.id',
      );
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

  private normalizeStatus(mpStatus: string): PaymentWebhookStatus {
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
