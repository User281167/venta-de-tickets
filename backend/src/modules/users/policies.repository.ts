import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { prisma } from '../../shared/database/prisma.client.js';
import {
  POLICY_CONFIGS,
  getPolicyFilePath,
} from '../../shared/policies/policies.config.js';
import { logger } from '../../utils/logger.js';
import { PolicyTypeValue } from './users.constants.js';

export function findCurrentVersion(type: PolicyTypeValue) {
  return prisma.policyVersion.findFirst({
    where: { policyType: type },
    orderBy: { publishedAt: 'desc' },
    select: { id: true, version: true, policyType: true, publishedAt: true },
  });
}

export function findVersionContent(type: PolicyTypeValue) {
  return prisma.policyVersion.findFirst({
    where: { policyType: type },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      version: true,
      policyType: true,
      content: true,
      contentHash: true,
      publishedAt: true,
    },
  });
}

export async function seedAllPolicies(): Promise<void> {
  for (const cfg of POLICY_CONFIGS) {
    const filePath = getPolicyFilePath(cfg.file);
    const content = readFileSync(filePath, 'utf8');
    const contentHash = createHash('sha256').update(content).digest('hex');

    const existing = await prisma.policyVersion.findUnique({
      where: {
        policyType_version: { policyType: cfg.type, version: cfg.version },
      },
      select: { contentHash: true },
    });

    if (!existing) {
      await prisma.policyVersion.create({
        data: {
          policyType: cfg.type,
          version: cfg.version,
          content,
          contentHash,
        },
      });

      logger.info(
        `Seeded PolicyVersion: type=${cfg.type} version=${cfg.version} hash=${contentHash.slice(0, 12)}`,
      );

      continue;
    }

    if (existing.contentHash === contentHash) continue;

    // Existe row sin hash → semilla inicial después de la migración, segura para poblar
    if (existing.contentHash === '') {
      await prisma.policyVersion.update({
        where: {
          policyType_version: { policyType: cfg.type, version: cfg.version },
        },
        data: { content, contentHash },
      });

      logger.info(
        `Populated PolicyVersion from file: type=${cfg.type} version=${cfg.version} hash=${contentHash.slice(0, 12)}`,
      );

      continue;
    }

    logger.error(
      `PolicyVersion content hash mismatch (version NOT bumped): type=${cfg.type} version=${cfg.version} expected_hash=${existing.contentHash.slice(0, 12)} actual_hash=${contentHash.slice(0, 12)}. Bump version in policies.config.ts.`,
    );
  }
}
