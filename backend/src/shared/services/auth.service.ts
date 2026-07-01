import { jwtVerify } from 'jose';
import { UnauthorizedError } from '../errors/UnauthorizedError.js';
import { JWKS } from '../database/supabase-jwks.js';

export type TokenPayload = {
  id: string;
  email: string;
  role: string | null;
};

export async function verifyToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, JWKS);

    return {
      id: payload.sub!,
      email: payload.email as string,
      role: (payload.app_metadata as Record<string, unknown> | undefined)?.role as string | null ?? null,
    };
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
