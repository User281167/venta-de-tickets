import { createRemoteJWKSet } from 'jose';
import { env } from '../config/env.js';

export const JWKS = createRemoteJWKSet(
  new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
);
