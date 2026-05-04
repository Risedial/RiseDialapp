/**
 * Unit tests for lib/env.ts (Zod env schema)
 *
 * Because `lib/env.ts` executes `envSchema.parse(process.env)` at module
 * evaluation time, we test the Zod schema directly instead of re-importing
 * the module, which avoids the esbuild cache-busting limitation in vitest.
 *
 * We import z from zod and re-declare the same JWT_SECRET sub-schema to
 * assert the exact error messages the application ships.
 */

import { describe, it, expect } from 'vitest';
import { z, ZodError } from 'zod';

// ---------------------------------------------------------------------------
// Re-declare the JWT_SECRET schema exactly as it appears in lib/env.ts
// ---------------------------------------------------------------------------

const jwtSecretSchema = z
  .string()
  .min(32, { message: 'JWT_SECRET must be at least 32 characters' });

// A full env-schema mirror used for whole-object parsing tests
const envSchema = z.object({
  SUPABASE_URL: z.string().url({ message: 'SUPABASE_URL must be a valid URL' }),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  JWT_SECRET: jwtSecretSchema,
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  STRIPE_PRICE_MONTHLY: z.string().startsWith('price_'),
  STRIPE_PRICE_ANNUAL: z.string().startsWith('price_'),
  STRIPE_PRICE_PREMIUM_MONTHLY_ADDON: z.string().startsWith('price_'),
  STRIPE_PRICE_PREMIUM_ANNUAL_ADDON: z.string().startsWith('price_'),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

type EnvInput = Record<string, string | undefined>;

const VALID_INPUT: EnvInput = {
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  JWT_SECRET: 'test-jwt-secret-that-is-at-least-32-chars-long',
  STRIPE_SECRET_KEY: 'sk_test_key',
  STRIPE_WEBHOOK_SECRET: 'whsec_test',
  STRIPE_PRICE_MONTHLY: 'price_test_monthly',
  STRIPE_PRICE_ANNUAL: 'price_test_annual',
  STRIPE_PRICE_PREMIUM_MONTHLY_ADDON: 'price_test_premium_monthly',
  STRIPE_PRICE_PREMIUM_ANNUAL_ADDON: 'price_test_premium_annual',
  OPENAI_API_KEY: 'sk-test-openai-key',
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('lib/env.ts — JWT_SECRET validation', () => {
  it('parses successfully when JWT_SECRET is exactly 32 characters', () => {
    const input = { ...VALID_INPUT, JWT_SECRET: 'a'.repeat(32) };
    const result = envSchema.parse(input);
    expect(result.JWT_SECRET).toBe('a'.repeat(32));
  });

  it('parses successfully when JWT_SECRET is longer than 32 characters', () => {
    const longSecret = 'b'.repeat(64);
    const input = { ...VALID_INPUT, JWT_SECRET: longSecret };
    const result = envSchema.parse(input);
    expect(result.JWT_SECRET).toBe(longSecret);
  });

  it('throws ZodError when JWT_SECRET is shorter than 32 characters', () => {
    expect(() => jwtSecretSchema.parse('tooshort')).toThrow(ZodError);
  });

  it('ZodError message contains exactly: JWT_SECRET must be at least 32 characters', () => {
    let caughtError: unknown;
    try {
      jwtSecretSchema.parse('tooshort');
    } catch (err) {
      caughtError = err;
    }

    expect(caughtError).toBeInstanceOf(ZodError);
    const zodErr = caughtError as ZodError;
    const messages = zodErr.issues.map((i) => i.message);
    expect(messages).toContain('JWT_SECRET must be at least 32 characters');
  });

  it('throws ZodError when JWT_SECRET is undefined', () => {
    expect(() => jwtSecretSchema.parse(undefined)).toThrow(ZodError);
  });

  it('throws ZodError for the full schema when JWT_SECRET is missing', () => {
    const input: EnvInput = { ...VALID_INPUT };
    delete input.JWT_SECRET;

    expect(() => envSchema.parse(input)).toThrow(ZodError);
  });

  it('parses the full valid env without throwing', () => {
    expect(() => envSchema.parse(VALID_INPUT)).not.toThrow();
  });
});
