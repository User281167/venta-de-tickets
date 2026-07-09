import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import * as ticketsService from './tickets.service.js';
import {
  paginationSchema,
  paramsSchema,
  createTicketSchema,
  updateTicketSchema,
} from './tickets.validators.js';

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const result = await ticketsService.listTicketTypes(page, limit);

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

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = paramsSchema.parse(req.params);
    const ticketType = await ticketsService.getTicketTypeById(id);

    res.json(ticketType);
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

export async function adminList(req: Request, res: Response): Promise<void> {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const result = await ticketsService.listAllTicketTypes(page, limit);

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

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const data = createTicketSchema.parse(req.body);
    const ticketType = await ticketsService.createTicketType(data);

    res.status(201).json(ticketType);
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

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const { id } = paramsSchema.parse(req.params);
    const data = updateTicketSchema.parse(req.body);
    const ticketType = await ticketsService.updateTicketType(id, data);

    res.json(ticketType);
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
