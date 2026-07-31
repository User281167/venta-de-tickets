import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import * as auditService from './audit.service.js';
import { listAuditLogQuerySchema } from './audit.validators.js';

export async function listAuditLog(req: Request, res: Response): Promise<void> {
  try {
    const filters = listAuditLogQuerySchema.parse(req.query);
    const result = await auditService.list({
      since: filters.since,
      entityType: filters.entityType,
      limit: filters.limit,
    });

    res.status(200).json({
      data: result.data.map((entry) => ({
        id: entry.id,
        eventId: entry.eventId,
        actorId: entry.actorId,
        actorRole: entry.actorRole,
        actorName: entry.actorName,
        actorCedula: entry.actorCedula,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        metadata: entry.metadata,
        createdAt: entry.createdAt.toISOString(),
      })),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: err.issues.map((i) => i.message).join(', '),
        },
      });

      return;
    }

    throw err;
  }
}
