export { messagingClient } from './messaging.client.js';
export { messagingService } from './messaging.service.js';
export {
  notifyPaymentConfirmed,
  notifyPaymentFailed,
  notifyPaymentUnfulfillable,
  notifyPaymentRefunded,
} from './notifications/payment-notifications.js';
export type {
  MessagingChannel,
  MessagingClient,
  ConfirmationLinkPayload,
} from './messaging.types.js';
