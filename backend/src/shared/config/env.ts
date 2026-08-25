import { z } from 'zod';

const envSchema = z.object({
  // prisma
  // Supabase
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

  // internal ingresos
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

  // internal client, api
  API_URL: z.string().url('API_URL must be a valid URL'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // mercadopago
  MERCADOPAGO_ACCESS_TOKEN: z
    .string()
    .min(1, 'MERCADOPAGO_ACCESS_TOKEN is required'),
  MERCADOPAGO_WEBHOOK_SECRET: z
    .string()
    .min(1, 'MERCADOPAGO_WEBHOOK_SECRET is required'),

  // ePayco Checkout
  EPAYCO_PUBLIC_KEY: z.string().min(1, 'EPAYCO_PUBLIC_KEY is required'),
  EPAYCO_PRIVATE_KEY: z.string().min(1, 'EPAYCO_PRIVATE_KEY is required'),
  EPAYCO_P_KEY: z.string().min(1, 'EPAYCO_P_KEY is required'),
  EPAYCO_CUST_ID_CLIENTE: z
    .string()
    .min(1, 'EPAYCO_CUST_ID_CLIENTE is required'),

  // resend
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  EMAIL_FROM: z.string().min(1, 'EMAIL_FROM is required'),

  // upstash
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  RATE_LIMIT_FAIL_OPEN: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  RATE_LIMIT_DISABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),

  // infobip
  INFOBIP_API_KEY: z.string().min(1, 'INFOBIP_API_KEY is required'),
  INFOBIP_BASE_URL: z.string().url('INFOBIP_BASE_URL must be a valid URL'),
  INFOBIP_SENDER_ID: z.string().min(1, 'INFOBIP_SENDER_ID is required'),
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
