import { ForbiddenError } from '../../shared/errors/ForbiddenError.js';
import { supabaseAdmin } from '../../shared/supabase/admin-client.js';
import * as adminsRepo from './admins.repository.js';

export async function listUsers(page: number, limit: number, search?: string) {
  const [data, total] = await Promise.all([
    adminsRepo.findAll(page, limit, search),
    adminsRepo.countAll(search),
  ]);

  return { data, total, page, limit };
}

export async function updateRole(id: string, role: string) {
  const existing = await adminsRepo.findById(id);

  if (!existing) {
    throw new ForbiddenError('User not found');
  }

  const [user] = await Promise.all([
    adminsRepo.updateRole(id, role),
    supabaseAdmin.auth.admin.updateUserById(id, {
      app_metadata: { role },
    }),
  ]);

  return user;
}

export async function createUser(data: Record<string, unknown>) {
  const email = String(data.email);
  const cedula = data.cedula ? String(data.cedula) : undefined;

  const existingEmail = await adminsRepo.findByEmail(email);
  if (existingEmail) {
    throw Object.assign(new Error('Email already exists'), {
      statusCode: 409,
      code: 'CONFLICT',
      message: `Email ${email} is already registered`,
    });
  }

  if (cedula) {
    const existingCedula = await adminsRepo.findByCedula(cedula);

    if (existingCedula) {
      throw Object.assign(new Error('Cedula already exists'), {
        statusCode: 409,
        code: 'CONFLICT',
        message: `Cedula ${cedula} is already in use`,
      });
    }
  }

  const { error: authError, data: authData } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password as string,
      email_confirm: true,
      app_metadata: { role: 'client' },
    });

  if (authError || !authData.user) {
    throw Object.assign(
      new Error(authError?.message ?? 'Failed to create auth user'),
      { statusCode: 502, code: 'AUTH_ERROR' },
    );
  }

  const userId = authData.user.id;

  const user = await adminsRepo.create({
    id: userId,
    email,
    fullName: String(data.fullName),
    cedula: cedula ?? null,
    phone: data.phone ? String(data.phone) : null,
    role: 'client',
  });

  return user;
}

export async function batchCreateUsers(dataArray: Record<string, unknown>[]) {
  const allEmails = dataArray.map((d) => d.email as string);
  const allCedulas = dataArray
    .map((d) => d.cedula as string | undefined)
    .filter(Boolean) as string[];

  const emailChecks = await Promise.all(
    allEmails.map((email) => adminsRepo.findByEmail(email)),
  );
  const emailConflicts = emailChecks.filter(Boolean);

  if (emailConflicts.length > 0) {
    throw Object.assign(
      new Error(
        `Emails already exist: ${emailConflicts.map((e) => e!.email).join(', ')}`,
      ),
      { statusCode: 409, code: 'CONFLICT' },
    );
  }

  if (allCedulas.length > 0) {
    const cedulaChecks = await Promise.all(
      allCedulas.map((cedula) => adminsRepo.findByCedula(cedula)),
    );

    const cedulaConflicts = cedulaChecks.filter(Boolean);

    if (cedulaConflicts.length > 0) {
      throw Object.assign(
        new Error(
          `Cedulas already in use: ${cedulaConflicts.map((c) => c!.cedula).join(', ')}`,
        ),
        { statusCode: 409, code: 'CONFLICT' },
      );
    }
  }

  const results = [];

  for (const data of dataArray) {
    try {
      const user = await createUser(data);
      results.push(user);
    } catch (err) {
      console.error('Batch create failed for', (data as any).email, err);
    }
  }

  return results;
}

export async function updateUser(id: string, data: Record<string, unknown>) {
  const existing = await adminsRepo.findById(id);

  if (!existing) {
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
      throw Object.assign(new Error('Cedula already in use by another user'), {
        statusCode: 409,
        code: 'CONFLICT',
      });
    }

    updateData.cedula = data.cedula;
  }

  if (data.role !== undefined) {
    const role = data.role as string;

    if (role === 'super_admin') {
      throw Object.assign(new Error('Cannot assign super_admin role'), {
        statusCode: 422,
        code: 'VALIDATION_ERROR',
      });
    }

    await supabaseAdmin.auth.admin.updateUserById(id, {
      app_metadata: { role },
    });

    updateData.role = role;
  }

  return adminsRepo.update(id, updateData);
}
