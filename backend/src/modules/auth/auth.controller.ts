import type { Request, Response } from 'express';
import * as adminsRepo from '../admins/admins.repository.js';

export async function sessionHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ role: null });
    return;
  }

  const admin = await adminsRepo.findById(userId);

  res.json({ role: admin?.role ?? null });
}
