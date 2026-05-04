import { z } from 'zod'

const envSchema = z.object({
  SUPABASE_URL: z
    .string()
    .url({ message: 'SUPABASE_URL must be a valid URL' }),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, { message: 'SUPABASE_SERVICE_ROLE_KEY is required' }),
  JWT_SECRET: z
    .string()
    .min(32, { message: 'JWT_SECRET must be at least 32 characters' }),
  STRIPE_SECRET_KEY: z
    .string()
    .startsWith('sk_', { message: 'STRIPE_SECRET_KEY must start with sk_' }),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .startsWith('whsec_', { message: 'STRIPE_WEBHOOK_SECRET must start with whsec_' }),
  STRIPE_PRICE_MONTHLY: z
    .string()
    .startsWith('price_', { message: 'must start with price_' }),
  STRIPE_PRICE_ANNUAL: z
    .string()
    .startsWith('price_', { message: 'must start with price_' }),
  STRIPE_PRICE_PREMIUM_MONTHLY_ADDON: z
    .string()
    .startsWith('price_', { message: 'must start with price_' }),
  STRIPE_PRICE_PREMIUM_ANNUAL_ADDON: z
    .string()
    .startsWith('price_', { message: 'must start with price_' }),
  OPENAI_API_KEY: z
    .string()
    .startsWith('sk-', { message: 'OPENAI_API_KEY must start with sk-' }),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url({ message: 'SUPABASE_URL must be a valid URL' }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, { message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required' }),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url({ message: 'NEXT_PUBLIC_APP_URL must be a valid URL' }),
})

export const env = envSchema.parse(process.env)
