import { prisma } from '../../../shared/database/prisma.client.js';
import { logger } from '../../../utils/logger.js';
import { messagingService } from '../messaging.service.js';

async function findDonationById(donationId: string) {
  return prisma.donation.findUnique({
    where: { id: donationId },
  });
}

export async function notifyDonationConfirmed(
  donationId: string,
): Promise<void> {
  try {
    const donation = await findDonationById(donationId);
    if (!donation) {
      logger.warn(
        `Cannot send donation confirmation email: donationId=${donationId} not found`,
      );
      return;
    }

    if (!donation.email) {
      logger.info(
        `Skipping donation confirmation email: missing email donationId=${donationId}`,
      );
      return;
    }

    await messagingService.sendDonationConfirmation({
      donorName: donation.full_name ?? 'Anónimo',
      donorEmail: donation.email,
      amountCents: Number(donation.amountCents),
      account: donation.account,
      confirmedAt: donation.updatedAt,
    });
  } catch (err) {
    logger.error(
      { err: (err as Error).message, donationId },
      '[messaging:notify] donation confirmation dispatch failed',
    );
  }
}

export async function notifyDonationRejected(
  donationId: string,
): Promise<void> {
  try {
    const donation = await findDonationById(donationId);
    if (!donation) {
      logger.warn(
        `Cannot send donation rejection email: donationId=${donationId} not found`,
      );
      return;
    }

    if (!donation.email) {
      logger.info(
        `Skipping donation rejection email: missing email donationId=${donationId}`,
      );
      return;
    }

    await messagingService.sendDonationRejection({
      donorName: donation.full_name ?? 'Anónimo',
      donorEmail: donation.email,
      amountCents: Number(donation.amountCents),
      account: donation.account,
      rejectedAt: donation.updatedAt,
    });
  } catch (err) {
    logger.error(
      { err: (err as Error).message, donationId },
      '[messaging:notify] donation rejection dispatch failed',
    );
  }
}

export async function notifyDonationCancelled(
  donationId: string,
): Promise<void> {
  try {
    const donation = await findDonationById(donationId);
    if (!donation) {
      logger.warn(
        `Cannot send donation cancellation email: donationId=${donationId} not found`,
      );
      return;
    }

    if (!donation.email) {
      logger.info(
        `Skipping donation cancellation email: missing email donationId=${donationId}`,
      );
      return;
    }

    await messagingService.sendDonationCancellation({
      donorName: donation.full_name ?? 'Anónimo',
      donorEmail: donation.email,
      amountCents: Number(donation.amountCents),
      account: donation.account,
      cancelledAt: donation.updatedAt,
    });
  } catch (err) {
    logger.error(
      { err: (err as Error).message, donationId },
      '[messaging:notify] donation cancellation dispatch failed',
    );
  }
}
