import type { Request, Response } from 'express';
import { isPolicyType } from './users.constants.js';
import * as usersService from './users.service.js';

export async function acceptPolicies(
  req: Request,
  res: Response,
): Promise<void> {
  const ipAddress = req.ip ?? 'unknown';
  const userAgent = req.headers['user-agent'] ?? 'unknown';

  const result = await usersService.acceptPolicies(
    req.user!.id,
    req.body.types,
    ipAddress,
    typeof userAgent === 'string' ? userAgent : 'unknown',
  );

  res.json(result);
}

export async function getPolicyStatus(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await usersService.getPolicyStatus(req.user!.id);
  res.json(result);
}

export async function getPolicyContent(
  req: Request,
  res: Response,
): Promise<void> {
  const { type } = req.params;
  const value = Array.isArray(type) ? type[0] : type;

  if (!value || !isPolicyType(value)) {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Policy type not found' },
    });
    return;
  }

  const policy = await usersService.getCurrentPolicyContent(value);

  if (!policy) {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Policy content not available' },
    });
    return;
  }

  res.json(policy);
}
