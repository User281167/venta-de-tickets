import type {
  Payment as PaymentModel,
  PaymentStatus as PrismaPaymentStatus,
} from '@prisma/client';

export type PaymentStatus = PrismaPaymentStatus;

export type PaymentWebhookStatus = 'approved' | 'declined' | 'pending';

export interface CheckoutInput {
  externalReference: string;
  amountCents: number;
  title: string;
  backUrl: string;
  expiresAt: string;
  payerEmail?: string;
  metadata?: Record<string, unknown>;
}

export interface CheckoutResult {
  checkoutUrl: string;
  providerTxId: string;
}

export interface NormalizedWebhookEvent {
  reference: string;
  status: PaymentWebhookStatus;
  externalId: string;
  rawPayload: unknown;
}

export interface PaymentProvider {
  getProviderName(): string;
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
  verifySignature(payload: unknown, signature: string): boolean;
  parseWebhook(payload: unknown): NormalizedWebhookEvent;
}

export type PaymentRecord = PaymentModel;
