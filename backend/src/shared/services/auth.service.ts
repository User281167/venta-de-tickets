import { UnauthorizedError } from '../errors/UnauthorizedError.js';
import { supabase } from '../supabase/client.js';

export async function verifyToken(token: string): Promise<{ id: string; email: string }> {
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new UnauthorizedError('Invalid or expired token');
  }

  const email = data.user.email;

  if (!email) {
    throw new UnauthorizedError('Token missing email');
  }

  return {
    id: data.user.id,
    email,
  };
}
