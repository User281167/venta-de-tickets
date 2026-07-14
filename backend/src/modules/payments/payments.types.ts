import type {
  Payment as PaymentModel,
  PaymentStatus as PrismaPaymentStatus,
} from '@prisma/client';

export type PaymentStatus = PrismaPaymentStatus;

export type PaymentWebhookStatus = 'approved' | 'declined' | 'pending';

export interface CheckoutItem {
  ticketTypeId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
}

export interface CheckoutInput {
  externalReference: string;
  items: CheckoutItem[];
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
  verifySignature(payload: unknown, headers: Record<string, string>): boolean;
  parseWebhook(payload: unknown): Promise<NormalizedWebhookEvent>;
}

export type PaymentRecord = PaymentModel;

export interface TicketQuantityInput {
  ticketTypeId: string;
  quantity: number;
}

export interface AdminPaymentInput {
  userId: string;
  provider: 'MANUAL' | 'GIFT';
  createdBy: string;
  tickets: TicketQuantityInput[];
}

export interface PaymentFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page: number;
  limit: number;
}
