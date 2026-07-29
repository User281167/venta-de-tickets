export interface EpaycoCheckoutResponse {
  paymentId: string;
  checkoutUrl: string;
  preferenceId: string;
  sessionId: string;
}

export interface EpaycoSessionRequest {
  items: Array<{ ticketTypeId: string; quantity: number }>;
  backUrl: string;
}

export interface EpaycoWebhookPayload {
  ref_payco: string;
  x_ref_payco: string;
  x_transaction_id: string;
  x_amount: string;
  x_currency_code: string;
  x_response: 'Aceptada' | 'Rechazada' | 'Pendiente' | 'Fallida';
  x_signature: string;
  x_extra1?: string;
}

export interface EpaycoStatusResponse {
  status: string;
  ePaycoStatus?: Record<string, unknown>;
}
