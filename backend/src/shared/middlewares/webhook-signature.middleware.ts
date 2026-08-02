import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { getProvider } from '../../modules/payments/providers/provider.registry.js';

export const verifyPaymentsWebhookSignature: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const providerName = req.params.provider as string;
    const provider = getProvider(providerName);
    const headers = req.headers as Record<string, string>;

    if (!provider.verifySignature(req.body, headers)) {
      res.status(401).json({
        error: { code: 'INVALID_SIGNATURE', message: 'Invalid webhook signature' },
      });
      return;
    }

    next();
  } catch (err) {
    next(err);
  }
};
