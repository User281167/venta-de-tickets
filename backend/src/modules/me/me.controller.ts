import type { Request, Response } from 'express';
import * as meService from './me.service.js';
import {
  setPersonalInfoSchema,
  updatePersonalInfoSchema,
} from './me.validators.js';

export function meHandler(req: Request, res: Response): void {
  res.json({ user: req.user });
}

export async function getPersonalInfoHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const info = await meService.getPersonalInfo(req.user!.id);
  res.json(info);
}

export async function setPersonalInfoHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const existing = await meService.getPersonalInfo(req.user!.id);
  const isFirstTime =
    existing.cedula === null && existing.fullName === null;

  const schema = isFirstTime ? setPersonalInfoSchema : updatePersonalInfoSchema;
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues.map((i) => i.message).join(', '),
      },
    });
    return;
  }

  const info = await meService.setPersonalInfo(
    req.user!.id,
    parsed.data as Record<string, unknown>,
  );

  res.json(info);
}
