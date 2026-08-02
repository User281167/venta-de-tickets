import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { getDonationProvider } from '../../modules/donaciones/providers/donation-provider.registry.js';

export function verifyDonationsWebhookSignature(
  providerName: string,
): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const provider = getDonationProvider(providerName);
      const headers = req.headers as Record<string, string>;

      if (!provider.verifySignature(req.body, headers)) {
        next(Object.assign(new Error('Invalid webhook signature'), { statusCode: 401, code: 'INVALID_SIGNATURE' }));
        return;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
