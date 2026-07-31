import { logger } from '../../utils/logger.js';
import { auditRepository } from './audit.repository.js';
import type { AuditLogInput, ListAuditLogResult } from './audit.types.js';

export async function log(input: AuditLogInput): Promise<void> {
  try {
    await auditRepository.create(input);
  } catch (err) {
    logger.error(
      { err, action: input.action, entityType: input.entityType, entityId: input.entityId },
      'audit log failed; mutation will not be reverted',
    );
  }
}

export async function list(params: {
  since?: Date;
  entityType?: string;
  limit: number;
}): Promise<ListAuditLogResult> {
  const rows = await auditRepository.findMany(params);

  const hasMore = rows.length > params.limit;
  const data = hasMore ? rows.slice(0, params.limit) : rows;

  return {
    data,
    nextCursor: null,
    hasMore,
  };
}
