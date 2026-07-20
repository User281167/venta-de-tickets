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

import { logger } from '../../../utils/logger.js';

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

    logger.info(
      `Creating checkout for external mercadopago reference ${input.externalReference}`,
    );

    const result = await preferenceClient.create({
      body: {
        items: input.items.map((item) => ({
          id: item.ticketTypeId,
          title: item.name,
          quantity: item.quantity,
          unit_price: item.unitPriceCents / 100,
        })),
        external_reference: input.externalReference,
        back_urls: {
          success: input.backUrl,
          failure: input.backUrl,
          pending: input.backUrl,
        },
        notification_url: `${env.API_URL}/api/payments/webhook/mercadopago`,
        payer: input.payerEmail ? { email: input.payerEmail } : undefined,
        date_of_expiration: input.expiresAt,
      },
    });

    logger.info(
      `Checkout created for external mercadopago  reference ${input.externalReference}, providerTxId: ${result.id!}`,
    );

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

      logger.info(`Signature verified for mercadopago dataId: ${dataId}`);

      return true;
    } catch (error) {
      logger.warn(
        `Signature verification failed for mercadopago dataId: ${error}`,
      );
      return false;
    }
  }

  async parseWebhook(payload: unknown): Promise<NormalizedWebhookEvent> {
    const body = payload as {
      type?: string;
      action?: string;
      data?: { id?: string | number };
    };

    logger.info(`Parsing mercadopago webhook payload: reference=${body.data?.id ?? ''}`);

    if (body.type !== 'payment' || !body.data?.id) {
      logger.warn(
        `Invalid webhook payload: expected payment type with data.id: ${body.data?.id}`,
      );

      throw new Error(
        'Invalid webhook payload: expected payment type with data.id',
      );
    }


    const paymentClient = new Payment(this.client);
    const mpPayment = await paymentClient.get({ id: body.data.id });

    const status = this.normalizeStatus(mpPayment.status ?? '');

    logger.info(
      `Parsed mercadopago webhook event: reference=${mpPayment.external_reference ?? ''}, status=${status}, externalId=${String(mpPayment.id)}`,
    );

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
