import type { Request, Response } from 'express';

import * as confirmationsService from './confirmations.service.js';

export async function confirm(req: Request, res: Response): Promise<void> {
  const result = await confirmationsService.confirm(
    req.confirmation?.ticketId ?? '',
  );
  res.json({ success: true, result });
}

export async function reject(req: Request, res: Response): Promise<void> {
  const result = await confirmationsService.reject(
    req.confirmation?.ticketId ?? '',
  );
  res.json({ success: true, result });
}
