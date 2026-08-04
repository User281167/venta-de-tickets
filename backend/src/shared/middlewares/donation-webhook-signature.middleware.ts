import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { getDonationProvider } from '../../modules/donaciones/providers/donation-provider.registry.js';
import { logger } from '../../utils/logger.js';

export const verifyDonationsWebhookSignature: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const providerName = req.params.provider as string;
    const provider = getDonationProvider(providerName);
    const headers = req.headers as Record<string, string>;

    if (!provider.verifySignature(req.body, headers)) {
      logger.warn(`Invalid donation webhook signature: providerName=${providerName}`);

      next(
        Object.assign(new Error('Invalid webhook signature'), {
          statusCode: 401,
          code: 'INVALID_SIGNATURE',
        }),
      );
      return;
    }

    next();
  } catch (err) {
    next(err);
  }
};
