/**
 * Unit tests for lib/memory/trigger.ts
 *
 * The module imports `supabaseServer` from '@/lib/supabase/server' and
 * issues a `.from('messages').select('*', { count: 'exact', head: true })`
 * chain to count user messages in a chat.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Types for mock chain builder
// ---------------------------------------------------------------------------

interface SelectChain {
  eq: ReturnType<typeof vi.fn>;
  not: ReturnType<typeof vi.fn>;
  // The chain eventually resolves, so we hold the terminal promise value here
  _resolve: (val: { count: number | null; error: null | { message: string } }) => void;
}

// ---------------------------------------------------------------------------
// Declare a mutable mock for the terminal promise so tests can reconfigure it
// ---------------------------------------------------------------------------

let mockChainResult: { count: number | null; error: null | { message: string } } = {
  count: 0,
  error: null,
};

let mockFrom = vi.fn();

// Build a chainable select that always resolves with mockChainResult
function buildChain() {
  const chain: Record<string, unknown> = {};
  const identity = () => chain;

  chain.eq = vi.fn(identity);
  chain.not = vi.fn(() => Promise.resolve(mockChainResult));

  return chain;
}

vi.mock('@/lib/supabase/server', () => ({
  supabaseServer: {
    get from() {
      return mockFrom;
    },
  },
}));

// ---------------------------------------------------------------------------
// Mock @/lib/env (required by any module that transitively imports it)
// ---------------------------------------------------------------------------
vi.mock('@/lib/env', () => ({
  env: {
    JWT_SECRET: 'test-jwt-secret-that-is-at-least-32-chars-long',
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
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
  },
}));

// ---------------------------------------------------------------------------
// Import the module under test AFTER mocks are declared
// ---------------------------------------------------------------------------
import { checkCompressionTrigger } from '@/lib/memory/trigger';

// ---------------------------------------------------------------------------
// Helper to set the count returned by the mock chain
// ---------------------------------------------------------------------------

function setCount(count: number | null): void {
  mockChainResult = { count, error: null };
}

function setError(message: string): void {
  mockChainResult = { count: null, error: { message } };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('checkCompressionTrigger', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockFrom.mockImplementation(() => {
      return {
        select: vi.fn(() => buildChain()),
      };
    });
  });

  it('count=49 → { shouldCompress: false, isInitial: false, isPatch: false }', async () => {
    setCount(49);
    const result = await checkCompressionTrigger('chat-1', 'user-1');
    expect(result).toEqual({ shouldCompress: false, isInitial: false, isPatch: false });
  });

  it('count=50 → { shouldCompress: true, isInitial: true, isPatch: false }', async () => {
    setCount(50);
    const result = await checkCompressionTrigger('chat-1', 'user-1');
    expect(result).toEqual({ shouldCompress: true, isInitial: true, isPatch: false });
  });

  it('count=51 → { shouldCompress: false, isInitial: false, isPatch: false }', async () => {
    setCount(51);
    const result = await checkCompressionTrigger('chat-1', 'user-1');
    expect(result).toEqual({ shouldCompress: false, isInitial: false, isPatch: false });
  });

  it('count=59 → { shouldCompress: false, isInitial: false, isPatch: false }', async () => {
    setCount(59);
    const result = await checkCompressionTrigger('chat-1', 'user-1');
    expect(result).toEqual({ shouldCompress: false, isInitial: false, isPatch: false });
  });

  it('count=60 → { shouldCompress: true, isInitial: false, isPatch: true }', async () => {
    setCount(60);
    const result = await checkCompressionTrigger('chat-1', 'user-1');
    expect(result).toEqual({ shouldCompress: true, isInitial: false, isPatch: true });
  });

  it('count=61 → { shouldCompress: false, isInitial: false, isPatch: false }', async () => {
    setCount(61);
    const result = await checkCompressionTrigger('chat-1', 'user-1');
    expect(result).toEqual({ shouldCompress: false, isInitial: false, isPatch: false });
  });

  it('count=70 → { shouldCompress: true, isInitial: false, isPatch: true }', async () => {
    setCount(70);
    const result = await checkCompressionTrigger('chat-1', 'user-1');
    expect(result).toEqual({ shouldCompress: true, isInitial: false, isPatch: true });
  });

  it('count=80 → { shouldCompress: true, isInitial: false, isPatch: true }', async () => {
    setCount(80);
    const result = await checkCompressionTrigger('chat-1', 'user-1');
    expect(result).toEqual({ shouldCompress: true, isInitial: false, isPatch: true });
  });

  it('supabase error → { shouldCompress: false, isInitial: false, isPatch: false }', async () => {
    setError('db error');
    const result = await checkCompressionTrigger('chat-1', 'user-1');
    expect(result).toEqual({ shouldCompress: false, isInitial: false, isPatch: false });
  });

  it('null count → { shouldCompress: false, isInitial: false, isPatch: false }', async () => {
    setCount(null);
    const result = await checkCompressionTrigger('chat-1', 'user-1');
    expect(result).toEqual({ shouldCompress: false, isInitial: false, isPatch: false });
  });
});
