export interface WhatsAppMessage {
  to: string;
  text: string;
  externalId: string;
  retryCount?: number;
}

export interface WhatsAppProvider {
  send(message: WhatsAppMessage): Promise<{ messageId: string }>;
  validateWebhook?(payload: unknown): boolean;
}
