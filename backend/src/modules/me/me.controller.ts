import type { Request, Response } from 'express';

export function meHandler(req: Request, res: Response): void {
  res.json({ user: req.user });
}
