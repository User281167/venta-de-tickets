import { auditUserCache, type AuditActorSnapshot } from './auditUser.cache.js';
import * as usersService from '../users/users.service.js';

export async function resolveActorSnapshot(
  actorId: string,
): Promise<AuditActorSnapshot> {
  const cached = auditUserCache.get(actorId);
  if (cached) {
    return cached;
  }

  const user = await usersService.getUserSnapshot(actorId);

  if (!user) {
    return { role: 'unknown', fullName: null, cedula: null };
  }

  const snapshot: AuditActorSnapshot = {
    role: user.role,
    fullName: user.fullName,
    cedula: user.cedula,
  };

  auditUserCache.set(actorId, snapshot);
  return snapshot;
}
