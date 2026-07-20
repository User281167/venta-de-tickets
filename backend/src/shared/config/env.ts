import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL is required'),
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  PORT: z.coerce.number().int().positive().default(3001),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  QR_JWT_SECRET: z
    .string()
    .min(32, 'QR_JWT_SECRET must be at least 32 characters'),
  CONFIRMATION_JWT_SECRET: z
    .string()
    .min(32, 'CONFIRMATION_JWT_SECRET must be at least 32 characters'),
  CONFIRMATION_TOKEN_TTL: z.string().default('30m'),
  CONFIRMATION_LINK_BASE_URL: z
    .string()
    .url('CONFIRMATION_LINK_BASE_URL must be a valid URL'),
  API_URL: z.string().url('API_URL must be a valid URL'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  MERCADOPAGO_ACCESS_TOKEN: z
    .string()
    .min(1, 'MERCADOPAGO_ACCESS_TOKEN is required'),
  MERCADOPAGO_WEBHOOK_SECRET: z
    .string()
    .min(1, 'MERCADOPAGO_WEBHOOK_SECRET is required'),
});

const dbURL = new URL(process.env.DATABASE_URL ?? '');

console.log({
  DATABASE_URL: !!process.env.DATABASE_URL,
  DIRECT_URL: !!process.env.DIRECT_URL,
  SUPABASE_URL: !!process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  PORT: !!process.env.PORT,
  NODE_ENV: !!process.env.NODE_ENV,
  QR_JWT_SECRET: !!process.env.QR_JWT_SECRET,
  CONFIRMATION_JWT_SECRET: !!process.env.CONFIRMATION_JWT_SECRET,
  CONFIRMATION_TOKEN_TTL: !!process.env.CONFIRMATION_TOKEN_TTL,
  CONFIRMATION_LINK_BASE_URL: !!process.env.CONFIRMATION_LINK_BASE_URL,
  API_URL: !!process.env.API_URL,
  CORS_ORIGIN: !!process.env.CORS_ORIGIN,
  MERCADOPAGO_ACCESS_TOKEN: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
  MERCADOPAGO_WEBHOOK_SECRET: !!process.env.MERCADOPAGO_WEBHOOK_SECRET,
  host: dbURL.hostname,
  port: dbURL.port,
  database: dbURL.pathname,
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  if (process.env.NODE_ENV === 'test') {
    throw new Error(`Invalid env: ${parsed.error.message}`);
  }

  console.error('Invalid environment variables:');

  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }

  process.exit(1);
}

export const env = parsed.data;
