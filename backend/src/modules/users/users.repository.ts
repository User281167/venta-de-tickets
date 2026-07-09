import { prisma } from '../../shared/database/prisma.client.js';
import { PolicyType } from '@prisma/client';
import type { UpdateUserInput } from './users.validators.js';

export function findById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      address: true,
      dateOfBirth: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export function update(id: string, data: UpdateUserInput) {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
    },
  });
}

export function createPrivacyAcceptance(
  userId: string,
  policyVersion: string,
  policyType: (typeof PolicyType)[keyof typeof PolicyType],
  ipAddress: string,
  userAgent: string,
) {
  return prisma.privacyAcceptance.create({
    data: {
      userId,
      policyVersion,
      policyType,
      ipAddress,
      userAgent,
    },
    select: {
      id: true,
      policyVersion: true,
      policyType: true,
      acceptedAt: true,
    },
  });
}

export function findPrivacyAcceptance(
  userId: string,
  policyVersion: string,
  policyType: (typeof PolicyType)[keyof typeof PolicyType],
) {
  return prisma.privacyAcceptance.findFirst({
    where: { userId, policyVersion, policyType },
    select: {
      acceptedAt: true,
      policyVersion: true,
    },
  });
}
