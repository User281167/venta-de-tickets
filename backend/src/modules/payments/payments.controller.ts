import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import * as paymentsService from './payments.service.js';
import { checkoutSchema, paymentStatusParamsSchema } from './payments.validators.js';

export async function handleCheckout(req: Request, res: Response): Promise<void> {
  try {
    const { items, backUrl, provider } = checkoutSchema.parse(req.body);
    const result = await paymentsService.createCheckout(req.user!.id, items, backUrl, provider);

    res.status(201).json(result);
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

export async function handleWebhook(req: Request, res: Response): Promise<void> {
  const result = await paymentsService.processWebhook(
    req.body,
    req.headers as Record<string, string>,
    req.params.provider as string,
  );

  res.json(result);
}

export async function handleGetPaymentStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = paymentStatusParamsSchema.parse(req.params);
    const result = await paymentsService.getPaymentStatus(id, req.user!.id, req.user!.role!);

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
