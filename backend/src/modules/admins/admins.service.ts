import { ForbiddenError } from '../../shared/errors/ForbiddenError.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { supabaseAdmin } from '../../shared/supabase/admin-client.js';
import * as adminsRepo from './admins.repository.js';
import * as paymentsService from '../payments/payments.service.js';

import { logger } from '../../utils/logger.js';
import { notifyPaymentConfirmed } from '../messaging/index.js';

const ROLES = ['admin', 'checker', 'client'];
const NO_ALLOWED_ROLES = ['super_admin'];

export async function listUsers(page: number, limit: number, search?: string) {
  const [data, total] = await Promise.all([
    adminsRepo.findAll(page, limit, search),
    adminsRepo.countAll(search),
  ]);

  return { data, total, page, limit };
}

export async function updateRole(id: string, role: string) {
  logger.info(`Updating role for user ${id} to ${role}`);

  const existing = await adminsRepo.findById(id);

  if (!existing) {
    logger.warn(`User not found: ${id}`);
    throw new ForbiddenError('User not found');
  }

  const [user] = await Promise.all([
    adminsRepo.updateRole(id, role),
    supabaseAdmin.auth.admin.updateUserById(id, {
      app_metadata: { role },
    }),
  ]);

  logger.info(`Role updated for user ${id} to ${role}`);

  return user;
}

export async function createUser(data: Record<string, unknown>) {
  logger.info(
    `Creating user with email ${data.email} and cedula ${data.cedula}`,
  );

  const email = String(data.email);
  const cedula = data.cedula ? String(data.cedula) : undefined;

  const { error: authError, data: authData } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password as string,
      email_confirm: true,
      app_metadata: { role: 'client' },
    });

  if (authError || !authData.user) {
    logger.warn(
      `Failed to create auth user: ${authError?.message ?? 'Unknown error'}`,
    );

    throw Object.assign(
      new Error(authError?.message ?? 'Failed to create auth user'),
      { statusCode: 502, code: 'AUTH_ERROR' },
    );
  }

  const userId = authData.user.id;

  try {
    const user = await adminsRepo.upsert({
      id: userId,
      email,
      fullName: String(data.fullName),
      cedula: cedula ?? null,
      phone: data.phone ? String(data.phone) : null,
      role: 'client',
    });

    logger.info(`User created: ${userId}`);

    return user;
  } catch (err) {
    if (
      typeof err === 'object' &&
      err !== null &&
      (err as Record<string, unknown>).code === 'P2002'
    ) {
      // si fallo por unique en email y cedula, auth trigger agrega de todos modos
      await supabaseAdmin.auth.admin.deleteUser(userId);

      throw Object.assign(new Error('Email or cedula already exists'), {
        statusCode: 409,
        code: 'CONFLICT',
        data: { emails: email ? [email] : [], cedulas: cedula ? [cedula] : [] },
      });
    }

    throw err;
  }
}

export async function batchCreateUsers(dataArray: Record<string, unknown>[]) {
  logger.info(`Batch creating users: ${dataArray.length} users`);

  const allEmails = dataArray.map((d) => d.email as string);
  const allCedulas = dataArray
    .map((d) => d.cedula as string | undefined)
    .filter(Boolean) as string[];

  const conflicts =
    allCedulas.length > 0
      ? await adminsRepo.findConflicts(allEmails, allCedulas)
      : await adminsRepo.findConflicts(allEmails, []);

  if (conflicts.length > 0) {
    const emailConflicts = conflicts.filter((c) => c.email).map((c) => c.email);
    const cedulaConflicts = conflicts
      .filter((c) => c.cedula)
      .map((c) => c.cedula);

    logger.warn(
      `Batch conflicts — emails: ${emailConflicts.join(', ')}, cedulas: ${cedulaConflicts.join(', ')}`,
    );

    throw Object.assign(new Error('Some emails or cedulas already exist'), {
      statusCode: 409,
      code: 'CONFLICT',
      data: { emails: emailConflicts, cedulas: cedulaConflicts },
    });
  }

  const results = [];

  for (const data of dataArray) {
    try {
      const user = await createUser(data);
      results.push(user);
    } catch (err) {
      logger.error('Batch create failed for', (data as any).email, err);
    }
  }

  logger.info(`Batch create completed: ${results.length} users created`);

  return results;
}

export async function checkUserExists(userId: string) {
  const user = await adminsRepo.findById(userId);
  return !!user;
}

export async function createAdminPayment(
  userId: string,
  provider: 'MANUAL' | 'GIFT',
  tickets: Array<{ ticketTypeId: string; quantity: number }>,
  adminId: string,
) {
  logger.info(
    `Creating admin payment: userId=${userId}, provider=${provider}, tickets=${JSON.stringify(tickets)}`,
  );

  const userExists = await checkUserExists(userId);
  if (!userExists) {
    logger.warn(`User not found: userId=${userId}`);
    throw new NotFoundError('User not found');
  }

  const result = await paymentsService.createAdminPayment({
    userId,
    provider,
    createdBy: adminId,
    tickets,
  });

  logger.info(`Admin payment created: paymentId=${result.paymentId}`);
  void notifyPaymentConfirmed(result.paymentId);

  return result;
}

export async function updateUser(id: string, data: Record<string, unknown>) {
  logger.info(`Updating user: id=${id}`);
  const existing = await adminsRepo.findById(id);

  if (!existing) {
    logger.warn(`User not found: id=${id}`);
    throw Object.assign(new Error('User not found'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  }

  const updateData: Record<string, unknown> = {};

  if (data.fullName !== undefined) updateData.fullName = data.fullName;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  if (data.cedula !== undefined) {
    const existingCedula = await adminsRepo.findByCedula(data.cedula as string);

    if (existingCedula && existingCedula.id !== id) {
      logger.warn(
        `Cedula already in use by another user: cedula=${data.cedula}`,
      );

      throw Object.assign(new Error('Cedula already in use by another user'), {
        statusCode: 409,
        code: 'CONFLICT',
      });
    }

    updateData.cedula = data.cedula;
  }

  if (data.role !== undefined) {
    const role = data.role as string;

    if (NO_ALLOWED_ROLES.includes(role)) {
      logger.warn(`Cannot assign ${role} role: role=${role}`);

      throw Object.assign(new Error(`Cannot assign ${role} role`), {
        statusCode: 422,
        code: 'VALIDATION_ERROR',
      });
    }

    if (!ROLES.includes(role)) {
      logger.warn(`Invalid role: role=${role}`);

      throw Object.assign(new Error(`Invalid role`), {
        statusCode: 422,
        code: 'VALIDATION_ERROR',
      });
    }

    await supabaseAdmin.auth.admin.updateUserById(id, {
      app_metadata: { role },
    });

    updateData.role = role;
  }

  logger.info(`User updated: id=${id}`);

  return adminsRepo.update(id, updateData);
}
