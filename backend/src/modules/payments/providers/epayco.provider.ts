import crypto from 'crypto';
import type {
  CheckoutInput,
  CheckoutResult,
  NormalizedWebhookEvent,
  PaymentProvider,
  PaymentWebhookStatus,
} from '../payments.types.js';
import { env } from '../../../shared/config/env.js';
import { logger } from '../../../utils/logger.js';
import { apifyAuthService } from './epayco/apify-auth.service.js';

export class EpaycoProvider implements PaymentProvider {
  getProviderName(): string {
    return 'epayco';
  }

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const token = await apifyAuthService.getToken();

    const totalAmount = input.items.reduce(
      (sum, item) => sum + (item.unitPriceCents / 100) * item.quantity,
      0,
    );

    logger.info(
      `Creating ePayco checkout session: externalReference=${input.externalReference}`,
    );

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
          name: input.items[0]?.name ?? 'Entradas para la Conveción de Egresados UTP 2026',
          currency: 'COP',
          amount: totalAmount,
          response: `${input.backUrl}/result`,
          confirmation: `${env.API_URL}/api/payments/webhook/epayco`,
          extras: {
            extra1: input.externalReference,
          },
          ...(input.payerEmail
            ? { billing: { email: input.payerEmail } }
            : {}),
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error(
        `ePayco session creation failed: status=${response.status}, body=${errorBody}`,
      );
      throw new Error(
        `ePayco session creation failed with status ${response.status}`,
      );
    }

    const data = (await response.json()) as {
      success?: boolean;
      data?: { sessionId?: string; token?: string };
    };

    if (!data.success || !data.data?.sessionId) {
      logger.error('ePayco session creation response missing sessionId');
      throw new Error('Failed to create ePayco checkout session');
    }

    const sessionId = data.data.sessionId;

    logger.info(
      `ePayco session created: sessionId=${sessionId}, externalReference=${input.externalReference}`,
    );

    return {
      checkoutUrl: '',
      providerTxId: sessionId,
      sessionId,
    };
  }

  verifySignature(
    payload: unknown,
    _headers: Record<string, string>,
  ): boolean {
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
      logger.warn('ePayco webhook signature verification failed');
      return false;
    }

    logger.info('ePayco webhook signature verified');
    return true;
  }

  async parseWebhook(payload: unknown): Promise<NormalizedWebhookEvent> {
    const data = payload as Record<string, string>;

    const xResponse = data.x_response ?? '';

    let status: PaymentWebhookStatus;
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
      `Parsed ePayco webhook: refPayco=${data.x_ref_payco ?? ''}, status=${status}, transactionId=${data.x_transaction_id ?? ''}`,
    );

    return {
      reference: data.x_extra1 ?? '',
      status,
      externalId: data.x_transaction_id ?? '',
      rawPayload: payload,
    };
  }
}
