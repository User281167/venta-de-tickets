import type { Request, Response } from 'express';
import * as usersService from './users.service.js';
import { updateUserSchema } from './users.validators.js';

export async function getMe(req: Request, res: Response): Promise<void> {
  const result = await usersService.getMe(req.user!.id);
  res.json(result);
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  const parsed = updateUserSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues.map((i) => i.message).join(', '),
      },
    });

    return;
  }

  const hasDisallowed = checkDisallowedFields(req.body);

  if (hasDisallowed) {
    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'email and id fields cannot be modified',
      },
    });

    return;
  }

  const user = await usersService.updateMe(req.user!.id, parsed.data);
  res.json({ user });
}

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

function checkDisallowedFields(body: Record<string, unknown>): boolean {
  if ('email' in body || 'id' in body) {
    return true;
  }

  return false;
}

export async function getPrivacyStatus(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await usersService.getMe(req.user!.id);

  res.json({
    consentStatus: result.consentStatus,
  });
}
