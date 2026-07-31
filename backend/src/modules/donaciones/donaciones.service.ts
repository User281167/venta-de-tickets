import { DonationStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { NotFoundError } from '../../shared/errors/index.js';
import { logger } from '../../utils/logger.js';
import { getDonationProvider } from './providers/donation-provider.registry.js';
import {
  donationRepository,
  createDonationUUID,
} from './donaciones.repository.js';
import type { CreateDonationInput } from './donaciones.schema.js';
import type { AdminListDonationsQuery } from './donaciones.schema.js';
import type { Donation } from '@prisma/client';

function generateExternalReference(account: string): string {
  return `DON-${account}-${createDonationUUID()}`;
}

function mapWebhookStatus(
  webhookStatus: string,
): DonationStatus | undefined {
  switch (webhookStatus) {
    case 'approved':
      return 'confirmed';
    case 'declined':
      return 'rejected';
    case 'pending':
      return undefined;
  }
}

export async function createDonation(
  input: CreateDonationInput,
): Promise<{ initPoint: string; sessionId?: string }> {
  const externalReference = generateExternalReference(input.account);

  const providerName = `${input.provider}-${input.account.toLowerCase().replace(/_/g, '-')}`;
  const provider = getDonationProvider(providerName);

  const result = await provider.createPreference({
    externalReference,
    amountCents: input.amountCents,
    description: `Donación para ${input.account === 'LA_CONVENCION' ? 'La Convención' : 'Barranqueros UTP'}`,
    backUrl: input.backUrl,
    payerEmail: input.email ?? undefined,
  });

  await donationRepository.create({
    fullName: input.fullName,
    email: input.email,
    amountCents: input.amountCents,
    account: input.account,
    externalReference,
  });

  return {
    initPoint: result.initPoint,
    sessionId: result.sessionId,
  };
}

export async function handleWebhook(
  providerName: string,
  payload: unknown,
  headers: Record<string, string>,
): Promise<void> {
  const provider = getDonationProvider(providerName);

  const isValid = provider.verifySignature(payload, headers);
  if (!isValid) {
    return;
  }

  const event = await provider.parseWebhook(payload);

  const newState = mapWebhookStatus(event.status);
  if (!newState) {
    return;
  }

  const updated = await donationRepository.updateStateByExternalReference(
    event.reference,
    {
      state: newState,
      paymentId: event.externalId,
      metadata: payload as Prisma.InputJsonValue,
    },
  );

  if (updated === 0) {
    logger.warn(
      `Donation webhook: no row updated for reference=${event.reference}, status=${event.status}, externalId=${event.externalId}. Current state likely doesn't allow transition.`,
    );
    return;
  }
}

export async function getStatus(
  externalReference: string,
): Promise<Donation> {
  const donation = await donationRepository.findByExternalReference(
    externalReference,
  );

  if (!donation) {
    throw new NotFoundError('Donación no encontrada');
  }

  return donation;
}

export async function listDonations(filters: AdminListDonationsQuery) {
  return donationRepository.findAllAdmin({
    page: filters.page,
    limit: filters.limit,
    state: filters.state,
    account: filters.account,
    search: filters.search,
  });
}
