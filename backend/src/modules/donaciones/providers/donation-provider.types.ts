export type DonationWebhookStatus = 'approved' | 'declined' | 'pending';

export interface DonationPreferenceInput {
  externalReference: string;
  amountCents: number;
  description: string;
  backUrl: string;
  payerEmail?: string;
}

export interface DonationPreferenceResult {
  initPoint: string;
  providerTxId: string;
}

export interface NormalizedDonationWebhookEvent {
  reference: string;
  status: DonationWebhookStatus;
  externalId: string;
  rawPayload: unknown;
}

export interface DonationProvider {
  getProviderName(): string;
  createPreference(input: DonationPreferenceInput): Promise<DonationPreferenceResult>;
  verifySignature(payload: unknown, headers: Record<string, string>): boolean;
  parseWebhook(payload: unknown): Promise<NormalizedDonationWebhookEvent>;
}