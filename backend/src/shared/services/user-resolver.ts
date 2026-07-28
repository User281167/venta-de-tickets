import { prisma } from '../database/prisma.client.js';

export async function resolveUser(
  userId: string,
  jwtRole: string | null,
): Promise<{ role: string; isActive: boolean } | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, isActive: true },
  });

  if (!user) return null

  return { role: jwtRole ?? user?.role, isActive: user?.isActive ?? false };
}
