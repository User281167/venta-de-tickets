import { prisma } from '../../shared/database/prisma.client.js';
import { auditUserCache, type AuditActorSnapshot } from './auditUser.cache.js';

export async function resolveActorSnapshot(
  actorId: string,
): Promise<AuditActorSnapshot> {
  const cached = auditUserCache.get(actorId);
  if (cached) {
    return cached;
  }

  const user = await prisma.user.findUnique({
    where: { id: actorId },
    select: { role: true, fullName: true, cedula: true },
  });

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
