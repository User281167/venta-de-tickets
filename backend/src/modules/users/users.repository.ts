import { prisma } from '../../shared/database/prisma.client.js';

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

export function findUserAcceptancesByType(userId: string) {
  return prisma.privacyAcceptance.findMany({
    where: { userId },
    select: {
      acceptedAt: true,
      policyVersion: {
        select: {
          id: true,
          version: true,
          policyType: true,
        },
      },
    },
  });
}

export function findAcceptanceByVersion(
  userId: string,
  policyVersionId: string,
) {
  return prisma.privacyAcceptance.findUnique({
    where: {
      userId_policyVersionId: { userId, policyVersionId },
    },
    select: {
      acceptedAt: true,
      policyVersionId: true,
    },
  });
}

export async function createAcceptance(
  userId: string,
  policyVersionId: string,
  ipAddress: string,
  userAgent: string,
) {
  return prisma.privacyAcceptance.create({
    data: {
      userId,
      policyVersionId,
      ipAddress,
      userAgent,
    },
    select: {
      id: true,
      policyVersionId: true,
      acceptedAt: true,
    },
  });
}
