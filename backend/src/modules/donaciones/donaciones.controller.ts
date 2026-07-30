import type { Request, Response } from 'express';
import { z } from 'zod';

import * as donacionesService from './donaciones.service.js';
import { createDonationSchema } from './donaciones.schema.js';

export async function createDonation(req: Request, res: Response): Promise<void> {
  const input = createDonationSchema.parse(req.body);

  const initPoint = await donacionesService.createDonation(input);

  res.status(201).json({ initPoint });
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