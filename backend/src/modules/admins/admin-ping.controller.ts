import type { Request, Response } from 'express';

export function adminPingHandler(_req: Request, res: Response): void {
  res.json({ status: 'ok', admin: true });
}
