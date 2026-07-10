import { z } from 'zod';

const envSchema = z.object({
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PORT: z.coerce.number().int().positive().default(3001),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  QR_JWT_SECRET: z
    .string()
    .min(32, 'QR_JWT_SECRET must be at least 32 characters'),
  API_URL: z.string().url('API_URL must be a valid URL'),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),
  MERCADOPAGO_ACCESS_TOKEN: z
    .string()
    .min(1, 'MERCADOPAGO_ACCESS_TOKEN is required'),
  MERCADOPAGO_WEBHOOK_SECRET: z
    .string()
    .min(1, 'MERCADOPAGO_WEBHOOK_SECRET is required'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
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
