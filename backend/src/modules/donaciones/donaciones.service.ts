import { DonationStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { NotFoundError } from '../../shared/errors/index.js';
import { logger } from '../../utils/logger.js';
import { getDonationProvider } from './providers/donation-provider.registry.js';
import {
  donationRepository,
  createDonationUUID,
} from './donaciones.repository.js';
import type {
  CreateDonationInput,
  AdminListDonationsQuery,
  UpdateDonationCounterInput,
} from './donaciones.schema.js';
import type { Donation, DonationCounter } from '@prisma/client';
import { DONATION_EXPIRY_INTERVAL_MILLIS } from '../../shared/config/constants.js';
import {
  notifyDonationConfirmed,
  notifyDonationRejected,
  notifyDonationCancelled,
} from '../messaging/index.js';
import { DONATION_ACCOUNT_LABELS } from './donaciones.types.js';

import * as auditService from '../audit/audit.service.js';
import {
  EVENT_ID,
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from '../audit/audit.constants.js';

function generateExternalReference(account: string): string {
  return `DON-${account}-${createDonationUUID()}`;
}

function mapWebhookStatus(webhookStatus: string): DonationStatus | undefined {
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
    description: `Donación para ${DONATION_ACCOUNT_LABELS[input.account]}`,
    backUrl: input.backUrl,
    payerEmail: input.email ?? undefined,
  });

  await donationRepository.create({
    fullName: input.fullName,
    email: input.email,
    company: input.company,
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
  _headers: Record<string, string>,
): Promise<void> {
  const provider = getDonationProvider(providerName);

  const event = await provider.parseWebhook(payload);

  const newState = mapWebhookStatus(event.status);
  if (!newState) {
    return;
  }

  const donation = await donationRepository.updateStateByExternalReference(
    event.reference,
    {
      state: newState,
      paymentId: event.externalId,
      metadata: payload as Prisma.InputJsonValue,
    },
  );

  if (!donation) {
    logger.warn(
      `Donation webhook: no row updated for reference=${event.reference}, status=${event.status}, externalId=${event.externalId}. Current state likely doesn't allow transition.`,
    );
    return;
  }

  if (newState === 'confirmed') {
    if (donation.amountCents > 0) {
      // ponytail: counter is auxiliary; failure must not block donation state or notification.
      void donationRepository
        .incrementCounterBy(donation.amountCents)
        .catch((err) =>
          logger.error(
            { err, donationId: donation.id, amountCents: donation.amountCents },
            'donation counter increment failed; donation state already confirmed',
          ),
        );
    }

    void notifyDonationConfirmed(donation.id);
  } else if (newState === 'rejected') {
    void notifyDonationRejected(donation.id);
  }
}

export async function getStatus(externalReference: string): Promise<Donation> {
  const donation =
    await donationRepository.findByExternalReference(externalReference);

  if (!donation) {
    throw new NotFoundError('Donación no encontrada');
  }

  return donation;
}

export async function getDonationForNotification(donationId: string) {
  return donationRepository.findById(donationId);
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

export async function sweepExpiredDonations(): Promise<number> {
  const cutoff = new Date(Date.now() - DONATION_EXPIRY_INTERVAL_MILLIS);
  const expired = await donationRepository.expirePending(cutoff);

  if (expired.length > 0) {
    logger.info(
      `Donation sweep completed: expiredCount=${expired.length}, cutoff=${cutoff.toISOString()}`,
    );

    for (const { id } of expired) {
      void notifyDonationCancelled(id);
    }
  }

  return expired.length;
}

export async function getCounter(): Promise<DonationCounter | null> {
  return donationRepository.findCounter();
}

export async function seedDonationCounter(): Promise<void> {
  try {
    await donationRepository.ensureCounterRow();
  } catch (err) {
    logger.error({ err }, 'donation counter seed failed');
  }
}

export async function updateCounter(
  input: UpdateDonationCounterInput,
  actor: { id: string },
): Promise<DonationCounter> {
  const before = await donationRepository.findCounter();
  const updated = await donationRepository.updateCounter({
    currentValue: input.currentValue,
    metaValue: input.metaValue,
    updatedBy: actor.id,
  });

  await auditService.log({
    eventId: EVENT_ID,
    actorId: actor.id,
    action: AUDIT_ACTIONS.DONATION_COUNTER_ACTUALIZADO,
    entityType: AUDIT_ENTITY_TYPES.CONTADOR_DONACIONES,
    entityId: '1',
    metadata: {
      valorAnterior: {
        currentValue: before?.currentValue ?? 0,
        metaValue: before?.metaValue ?? 0,
      },
      valorNuevo: {
        currentValue: updated.currentValue,
        metaValue: updated.metaValue,
      },
    },
  });

  return updated;
}
