import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import * as checkinService from './checkin.service.js';
import { checkinSchema } from './checkin.validators.js';

export async function handleCheckIn(req: Request, res: Response): Promise<void> {
  try {
    const { qrToken } = checkinSchema.parse(req.body);
    const result = await checkinService.checkIn(qrToken, req.user!.id);

    res.json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: err.issues.map((i) => i.message).join(', '),
        },
      });

      return;
    }

    throw err;
  }
}
