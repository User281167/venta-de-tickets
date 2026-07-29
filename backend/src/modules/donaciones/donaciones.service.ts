import { DonationStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { env } from '../../shared/config/env.js';
import { NotFoundError } from '../../shared/errors/index.js';
import { getDonationProvider } from './providers/donation-provider.registry.js';
import {
  donationRepository,
  createDonationUUID,
} from './donaciones.repository.js';
import type { CreateDonationInput } from './donaciones.schema.js';
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
): Promise<string> {
  const externalReference = generateExternalReference(input.account);

  const provider = getDonationProvider(
    `mercadopago-${input.account.toLowerCase()}`,
  );

  const result = await provider.createPreference({
    externalReference,
    amountCents: input.amountCents,
    description: `Donación - ${input.account.replace('_', ' ')}`,
    backUrl: `${env.CONFIRMATION_LINK_BASE_URL}/donaciones/retorno/?external_reference=${externalReference}`,
    payerEmail: input.email ?? undefined,
  });

  await donationRepository.create({
    fullName: input.fullName,
    email: input.email,
    amountCents: input.amountCents,
    account: input.account,
    externalReference,
  });

  return result.initPoint;
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
