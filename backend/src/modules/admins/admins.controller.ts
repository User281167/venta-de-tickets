import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import * as adminsService from './admins.service.js';
import * as surveysService from '../surveys/surveys.service.js';
import { updateRoleSchema } from './admins.validators.js';

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

export async function listUsers(req: Request, res: Response): Promise<void> {
  const page = Math.max(1, parseInt(req.query['page'] as string) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query['limit'] as string) || 20),
  );
  const search = (req.query['search'] as string) || undefined;

  const result = await adminsService.listUsers(page, limit, search);

  res.json(result);
}

export async function listOnboardingSurveys(
  _req: Request,
  res: Response,
): Promise<void> {
  const data = await surveysService.adminGetOnboarding();

  res.json({ data });
}

export async function updateUserRole(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { role } = updateRoleSchema.parse(req.body);
    const user = await adminsService.updateRole(String(req.params.id), role);
    res.json(user);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: 'Invalid role', details: err.issues });
      return;
    }
    throw err;
  }
}
