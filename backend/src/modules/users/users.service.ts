import {
  PRIVACY_POLICY_VERSION,
  PRIVACY_POLICY_TYPE,
} from '../../shared/config/constants.js';
import * as usersRepo from './users.repository.js';

export async function getPrivacyStatus(userId: string) {
  const acceptance = await usersRepo.findPrivacyAcceptance(
    userId,
    PRIVACY_POLICY_VERSION,
    PRIVACY_POLICY_TYPE,
  );

  return {
    consentStatus: {
      required: true,
      acceptedAt: acceptance?.acceptedAt.toISOString() ?? null,
      policyVersion: acceptance?.policyVersion ?? PRIVACY_POLICY_VERSION,
    },
  };
}

export async function acceptPrivacy(
  userId: string,
  ipAddress: string,
  userAgent: string,
) {
  const existing = await usersRepo.findPrivacyAcceptance(
    userId,
    PRIVACY_POLICY_VERSION,
    PRIVACY_POLICY_TYPE,
  );

  if (existing) {
    return {
      status: 'accepted',
      acceptedAt: existing.acceptedAt.toISOString(),
      policyVersion: existing.policyVersion,
    };
  }

  const acceptance = await usersRepo.createPrivacyAcceptance(
    userId,
    PRIVACY_POLICY_VERSION,
    PRIVACY_POLICY_TYPE,
    ipAddress,
    userAgent,
  );

  return {
    status: 'accepted',
    acceptedAt: acceptance.acceptedAt.toISOString(),
    policyVersion: acceptance.policyVersion,
  };
}
