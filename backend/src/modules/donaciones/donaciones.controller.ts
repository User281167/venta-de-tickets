import type { Request, Response } from 'express';
import { z, ZodError } from 'zod';

import * as donacionesService from './donaciones.service.js';
import {
  createDonationSchema,
  adminListDonationsQuerySchema,
} from './donaciones.schema.js';

export async function createDonation(req: Request, res: Response): Promise<void> {
  const input = createDonationSchema.parse(req.body);

  const result = await donacionesService.createDonation(input);

  res.status(201).json(result);
}

export async function handleLaConvencionWebhook(
  req: Request,
  res: Response,
): Promise<void> {
  await donacionesService.handleWebhook(
    'mercadopago-la-convencion',
    req.body,
    req.headers as Record<string, string>,
  );

  res.status(200).json({ status: 'processed' });
}

export async function handleBarranquerosWebhook(
  req: Request,
  res: Response,
): Promise<void> {
  await donacionesService.handleWebhook(
    'mercadopago-barranqueros-utp',
    req.body,
    req.headers as Record<string, string>,
  );

  res.status(200).json({ status: 'processed' });
}

export async function handleEpaycoLaConvencionWebhook(
  req: Request,
  res: Response,
): Promise<void> {
  await donacionesService.handleWebhook(
    'epayco-la-convencion',
    req.body,
    req.headers as Record<string, string>,
  );

  res.status(200).json({ status: 'processed' });
}

export async function handleEpaycoBarranquerosWebhook(
  req: Request,
  res: Response,
): Promise<void> {
  await donacionesService.handleWebhook(
    'epayco-barranqueros-utp',
    req.body,
    req.headers as Record<string, string>,
  );

  res.status(200).json({ status: 'processed' });
}

export async function getStatus(req: Request, res: Response): Promise<void> {
  const externalReference = z.string().parse(req.params.externalReference);

  const donation = await donacionesService.getStatus(externalReference);

  res.status(200).json({
    state: donation.state,
    account: donation.account,
    amountCents: Number(donation.amountCents),
    fullName: donation.full_name,
    createdAt: donation.createdAt.toISOString(),
  });
}

export async function listDonations(req: Request, res: Response): Promise<void> {
  try {
    const filters = adminListDonationsQuerySchema.parse(req.query);

    const result = await donacionesService.listDonations(filters);

    res.status(200).json({
      data: result.data.map((donation) => ({
        id: donation.id,
        fullName: donation.full_name,
        email: donation.email,
        amountCents: Number(donation.amountCents),
        state: donation.state,
        account: donation.account,
        externalReference: donation.externalReference,
        paymentId: donation.paymentId,
        createdAt: donation.createdAt.toISOString(),
        updatedAt: donation.updatedAt.toISOString(),
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
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