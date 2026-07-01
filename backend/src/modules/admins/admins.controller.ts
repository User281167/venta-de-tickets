import type { Request, Response } from 'express';
import * as adminsService from './admins.service.js';
import * as surveysService from '../surveys/surveys.service.js';

export async function getMe(req: Request, res: Response): Promise<void> {
  res.json(req.admin);
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
