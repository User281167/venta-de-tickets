import { logger } from '../../utils/logger.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import * as paymentsRepo from './payments.repository.js';

// Estado de un pago propio (autenticado). Si sigue 'pending' y se pasó
// refPayco, consulta ePayco en vivo para devolver el estado real del
// proveedor mientras la webhook no llega.
export async function getEpaycoPaymentStatus(
  paymentId: string,
  refPayco?: string,
) {
  const payment = await paymentsRepo.findByIdWithTickets(paymentId);

  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  const status: { status: string; ePaycoStatus?: Record<string, unknown> } = {
    status: payment.status,
  };

  if (payment.status === 'pending' && refPayco) {
    try {
      const response = await fetch(
        `https://secure.epayco.co/validation/v1/reference/${refPayco}`,
      );

      if (response.ok) {
        const validation = await response.json();
        status.ePaycoStatus = validation as Record<string, unknown>;
      }
    } catch {
      logger.warn(`ePayco validation API call failed for ref=${refPayco}`);
    }
  }

  return status;
}

// Estado público por ref_payco. La respuesta cruda de ePayco incluye
// x_customer_*, x_billing_*, x_amount, x_currency_code y otros datos
// personales/financieros; aquí se proyectan solo los campos no sensibles.
export async function getEpaycoStatusByRef(refPayco: string) {
  const response = await fetch(
    `https://secure.epayco.co/validation/v1/reference/${refPayco}`,
  );

  if (!response.ok) {
    throw new Error(`ePayco validation failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    success?: boolean;
    data?: {
      x_response?: string;
      x_ref_payco?: string;
      x_transaction_id?: string;
      x_response_reason_text?: string;
      [key: string]: unknown;
    };
  };

  if (!data.success) {
    return { status: 'pending' as const };
  }

  const raw = data.data ?? {};
  const xResponse = raw.x_response ?? '';

  let status: 'completed' | 'failed' | 'pending';
  switch (xResponse) {
    case 'Aceptada':
      status = 'completed';
      break;
    case 'Rechazada':
    case 'Fallida':
      status = 'failed';
      break;
    default:
      status = 'pending';
  }

  const validation = {
    x_response: raw.x_response,
    x_ref_payco: raw.x_ref_payco,
    x_transaction_id: raw.x_transaction_id,
    x_response_reason_text: raw.x_response_reason_text,
  };

  return { status, validation };
}
