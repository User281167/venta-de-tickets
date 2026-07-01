import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import * as ticketTypesService from './ticket-types.service.js';
import {
  eventIdParamSchema,
  createTicketTypeSchema,
  updateTicketTypeSchema,
} from './ticket-types.validators.js';

export async function listPublishedEvents(
  _req: Request,
  res: Response,
): Promise<void> {
  const events = await ticketTypesService.listPublishedEvents();

  res.json({ data: events });
}

export async function getEventWithAvailability(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await ticketTypesService.getEventWithAvailability(
    String(req.params.eventId),
  );

  res.json(result);
}

export async function listTicketTypes(
  req: Request,
  res: Response,
): Promise<void> {
  const eventId = String(req.params.eventId);
  const types = await ticketTypesService.listTicketTypes(eventId);

  res.json({ data: types });
}

export async function getTicketType(
  req: Request,
  res: Response,
): Promise<void> {
  const type = await ticketTypesService.getTicketType(String(req.params.id));

  res.json(type);
}

export async function createTicketType(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const data = createTicketTypeSchema.parse(req.body);
    const type = await ticketTypesService.createTicketType({
      ...data,
      eventId: String(req.params.eventId),
    });

    res.status(201).json(type);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: 'Invalid data', details: err.issues });
      return;
    }

    throw err;
  }
}

export async function updateTicketType(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const data = updateTicketTypeSchema.parse(req.body);
    const type = await ticketTypesService.updateTicketType(
      String(req.params.id),
      data,
    );

    res.json(type);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: 'Invalid data', details: err.issues });
      return;
    }

    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
      return;
    }

    throw err;
  }
}

export async function deactivateTicketType(
  req: Request,
  res: Response,
): Promise<void> {
  await ticketTypesService.deactivateTicketType(String(req.params.id));

  res.json({ message: 'Ticket type deactivated' });
}
