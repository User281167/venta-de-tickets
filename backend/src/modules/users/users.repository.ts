import { prisma } from '../../shared/database/prisma.client.js';
import { PolicyType } from '@prisma/client';

export function findAuthUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, isActive: true },
  });
}

export function findUserSnapshot(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, fullName: true, cedula: true },
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
