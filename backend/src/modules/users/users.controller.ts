import type { Request, Response } from 'express';
import * as usersService from './users.service.js';

export async function acceptPrivacy(
  req: Request,
  res: Response,
): Promise<void> {
  const ipAddress = req.ip ?? 'unknown';
  const userAgent = req.headers['user-agent'] ?? 'unknown';

  const result = await usersService.acceptPrivacy(
    req.user!.id,
    ipAddress,
    userAgent,
  );

  res.json(result);
}

export async function getPrivacyStatus(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await usersService.getPrivacyStatus(req.user!.id);

  res.json(result);
}
