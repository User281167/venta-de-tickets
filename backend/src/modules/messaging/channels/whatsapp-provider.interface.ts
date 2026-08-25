export interface WhatsAppTemplate {
  name: string;
  language: 'es' | 'en' | 'pt';
  parameters?: string[]; // Placeholders ordenados
}

export interface WhatsAppMessage {
  to: string; // ej: +57301234567
  template: WhatsAppTemplate;
  externalId: string; // Idempotencia
  retryCount?: number; // Interno, para reintentos
}

export interface WhatsAppProvider {
  send(message: WhatsAppMessage): Promise<{ messageId: string }>;
  validateWebhook?(payload: unknown): boolean; // Opcional
}
