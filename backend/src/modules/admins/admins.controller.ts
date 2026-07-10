import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import * as adminsService from './admins.service.js';
import * as paymentsService from '../payments/payments.service.js';
import {
  createUserSchema,
  batchCreateUsersSchema,
  updateUserSchema,
  updateRoleSchema,
  paginationSchema,
  paymentPaginationSchema,
  paymentParamsSchema,
} from './admins.validators.js';

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = req.user!;

  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

export async function listUsers(req: Request, res: Response): Promise<void> {
  const { page, limit, search } = paginationSchema.parse(req.query);
  const result = await adminsService.listUsers(page, limit, search);

  res.json(result);
}

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const data = createUserSchema.parse(req.body);
    const user = await adminsService.createUser(data);

    res.status(201).json(user);
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

export async function batchCreateUsers(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const dataArray = batchCreateUsersSchema.parse(req.body);
    const users = await adminsService.batchCreateUsers(dataArray);

    res.status(201).json(users);
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

export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    const data = updateUserSchema.parse(req.body);
    const user = await adminsService.updateUser(String(req.params.id), data);

    res.json(user);
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

export async function updateUserRole(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { role } = updateRoleSchema.parse(req.body);
    const user = await adminsService.updateRole(String(req.params.id), role);

    res.json(user);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: 'Invalid role', details: err.issues });
      return;
    }

    throw err;
  }
}

export async function listPaymentsHandler(req: Request, res: Response): Promise<void> {
  try {
    const { page, limit } = paymentPaginationSchema.parse(req.query);
    const result = await paymentsService.listAllPayments(page, limit);

    res.json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(422).json({
        error: { code: 'VALIDATION_ERROR', message: err.issues.map((i) => i.message).join(', ') },
      });

      return;
    }

    throw err;
  }
}

export async function getPaymentDetailHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = paymentParamsSchema.parse(req.params);
    const result = await paymentsService.getPaymentDetail(id);

    res.json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(422).json({
        error: { code: 'VALIDATION_ERROR', message: err.issues.map((i) => i.message).join(', ') },
      });

      return;
    }

    throw err;
  }
}
