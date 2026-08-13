import { ValidationError } from '../../shared/errors/ValidationError.js';
import { POLICY_TYPES, type PolicyTypeValue } from './users.constants.js';
import * as policiesRepo from './policies.repository.js';
import * as usersRepo from './users.repository.js';
import { logger } from '../../utils/logger.js';
import { AcceptPoliciesResult, PolicyStatusItem } from './user.types.js';

export async function getUserAuthInfo(
  userId: string,
  jwtRole: string | null,
): Promise<{ role: string; isActive: boolean } | null> {
  const user = await usersRepo.findAuthUser(userId);

  if (!user) return null;

  return { role: jwtRole ?? user.role, isActive: user.isActive ?? false };
}

export async function getUserSnapshot(userId: string) {
  return usersRepo.findUserSnapshot(userId);
}

export async function getPolicyStatus(userId: string): Promise<{
  policies: PolicyStatusItem[];
}> {
  const currentVersions = await Promise.all(
    POLICY_TYPES.map((type) => policiesRepo.findCurrentVersion(type)),
  );

  const userAcceptances = await usersRepo.findUserAcceptancesByType(userId);

  const policies: PolicyStatusItem[] = currentVersions.map((cv, i) => {
    const type = POLICY_TYPES[i];
    const accepted = cv
      ? userAcceptances.find((a) => a.policyVersion.id === cv.id)
      : undefined;

    return {
      type,
      currentVersion: cv?.version ?? '',
      accepted: Boolean(accepted),
      acceptedAt: accepted ? accepted.acceptedAt.toISOString() : null,
    };
  });

  logger.info(`Policy status retrieved: userId=${userId}`);

  return { policies };
}

export async function getCurrentPolicyContent(type: PolicyTypeValue) {
  const policy = await policiesRepo.findVersionContent(type);

  if (!policy) return null;

  return {
    type: policy.policyType,
    version: policy.version,
    content: policy.content,
    publishedAt: policy.publishedAt.toISOString(),
  };
}

export async function acceptPolicies(
  userId: string,
  types: PolicyTypeValue[],
  ipAddress: string,
  userAgent: string,
): Promise<AcceptPoliciesResult> {
  if (!types.length) {
    throw new ValidationError(
      'VALIDATION_ERROR',
      'At least one policy type is required',
    );
  }

  const invalid = types.filter((t) => !POLICY_TYPES.includes(t));

  if (invalid.length) {
    throw new ValidationError(
      'VALIDATION_ERROR',
      `Unknown policy types: ${invalid.join(', ')}`,
    );
  }

  const results: AcceptPoliciesResult['results'] = [];

  for (const type of types) {
    const current = await policiesRepo.findCurrentVersion(type);

    if (!current) {
      throw new ValidationError(
        'VALIDATION_ERROR',
        `No active version for policy type: ${type}`,
      );
    }

    const existing = await usersRepo.findAcceptanceByVersion(
      userId,
      current.id,
    );

    if (existing) {
      logger.info(
        `Policy already accepted: userId=${userId} type=${type} version=${current.version}`,
      );

      results.push({
        type,
        version: current.version,
        status: 'skipped',
        acceptedAt: existing.acceptedAt.toISOString(),
      });

      continue;
    }

    const acceptance = await usersRepo.createAcceptance(
      userId,
      current.id,
      ipAddress,
      userAgent,
    );

    logger.info(
      `Policy accepted: userId=${userId} type=${type} version=${current.version}`,
    );

    results.push({
      type,
      version: current.version,
      status: 'accepted',
      acceptedAt: acceptance.acceptedAt.toISOString(),
    });
  }

  return { results };
}
