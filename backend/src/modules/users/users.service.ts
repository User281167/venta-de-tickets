import {
  PRIVACY_POLICY_VERSION,
  PRIVACY_POLICY_TYPE,
} from '../../shared/config/constants.js';
import { ForbiddenError } from '../../shared/errors/ForbiddenError.js';
import * as usersRepo from './users.repository.js';
import type { UpdateUserInput } from './users.validators.js';

export async function getMe(id: string) {
  const user = await usersRepo.findById(id);

  if (!user) {
    throw new ForbiddenError('User profile not found');
  }

  const acceptance = await usersRepo.findPrivacyAcceptance(
    id,
    PRIVACY_POLICY_VERSION,
    PRIVACY_POLICY_TYPE,
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
    },
    consentStatus: {
      required: true,
      acceptedAt: acceptance?.acceptedAt.toISOString() ?? null,
      policyVersion: PRIVACY_POLICY_VERSION,
    },
  };
}

export async function updateMe(id: string, data: UpdateUserInput) {
  const user = await usersRepo.update(id, data);

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
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
