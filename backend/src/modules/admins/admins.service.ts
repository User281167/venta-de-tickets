import * as adminsRepo from './admins.repository.js';

export async function listUsers(page: number, limit: number, search?: string) {
  const [data, total] = await Promise.all([
    adminsRepo.findAll(page, limit, search),
    adminsRepo.countAll(search),
  ]);

  return { data, total, page, limit };
}
