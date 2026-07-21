import type { Request, Response } from 'express';
import { ZodError } from 'zod';

import * as checkinService from './checkin.service.js';
import { scanSchema, ticketActionSchema } from './checkin.validators.js';

export async function scan(req: Request, res: Response): Promise<void> {
  try {
    const { qrToken } = scanSchema.parse(req.body);
    const ticket = await checkinService.scanTicket(qrToken);

    res.json(ticket);
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

export async function confirmEntry(req: Request, res: Response): Promise<void> {
  try {
    const { ticketId } = ticketActionSchema.parse(req.body);
    await checkinService.confirmEntryDirect(ticketId, req.user!.id);

    res.json({ success: true });
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

export async function requestConfirmationHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { ticketId } = ticketActionSchema.parse(req.body);
    await checkinService.requestConfirmation(ticketId, req.user!.id);

    res.json({ success: true });
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

export async function allowEntryHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { ticketId } = ticketActionSchema.parse(req.body);
    await checkinService.allowEntry(ticketId, req.user!.id);

    res.json({ success: true });
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
