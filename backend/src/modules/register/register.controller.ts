import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import {
  cedulaSchema,
  confirmRegisterInput,
  registerInput,
} from './register.schema.js';
import {
  confirmRegister,
  getRegisterEvent,
  register,
} from './register.service.js';

export async function registerEvent(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const data = registerInput.parse(req.body);
    await register(data);
    res.status(201).json({ success: true });
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

export async function getRegister(req: Request, res: Response): Promise<void> {
  const { cedula } = req.params;

  const parsedCedula = cedulaSchema.safeParse(cedula);
  if (!parsedCedula.success) {
    res.status(422).json({
      error: { code: 'VALIDATION_ERROR', message: 'cedula is required' },
    });
    return;
  }

  const data = await getRegisterEvent(parsedCedula.data);
  res.json({ success: true, data: data ?? null });
}

export async function setRegisterConfirmation(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const cedula = cedulaSchema.parse(req.params.cedula);
    const { confirmed } = confirmRegisterInput.parse(req.body);

    const data = await confirmRegister(cedula, confirmed);
    res.json({ success: true, data });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: err.issues.map((issue) => issue.message).join(', '),
        },
      });
      return;
    }

    throw err;
  }
}
