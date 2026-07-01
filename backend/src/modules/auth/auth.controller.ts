import type { Request, Response } from 'express';

export async function sessionHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ role: null });
    return;
  }

  res.json({ role: req.user!.role ?? null });
}
