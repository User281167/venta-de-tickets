// Fachada del servicio de pagos. La lógica vive en archivos por concern
// para mantener cada uno pequeño y testeable; este módulo solo re-exporta
// para preservar la API pública.

export { createCheckout, generateTicketCode } from './payments.service.checkout.js';
export { processWebhook } from './payments.service.webhook.js';
export { getEpaycoPaymentStatus, getEpaycoStatusByRef } from './payments.service.epayco.js';
export {
  listMyPayments,
  listAllPayments,
  getPaymentDetail,
  getPaymentForNotification,
  getPaymentStatus,
} from './payments.service.queries.js';
export { createAdminPayment, processRefund } from './payments.service.admin.js';
