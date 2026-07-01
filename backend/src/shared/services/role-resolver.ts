import { prisma } from '../database/prisma.client.js';

export async function resolveRole(
  userId: string,
  jwtRole: string | null,
): Promise<string | null> {
  if (jwtRole) return jwtRole;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role ?? null;
}
