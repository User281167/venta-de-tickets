import { ForbiddenError } from '../../shared/errors/ForbiddenError.js';
import { supabaseAdmin } from '../../shared/supabase/admin-client.js';
import * as adminsRepo from './admins.repository.js';

export async function listUsers(page: number, limit: number, search?: string) {
  const [raw, total] = await Promise.all([
    adminsRepo.findAll(page, limit, search),
    adminsRepo.countAll(search),
  ]);

  const data = raw.map(({ surveyResponses, ...rest }) => ({
    ...rest,
    onboardingSurveyDone: surveyResponses.length > 0,
  }));

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
