/**
 * Unit tests for lib/rise/rate-limit.ts
 *
 * The module imports `supabaseServer` from '@/lib/supabase/server' and
 * uses it to query the `rate_limit_tracking` table and to call the
 * `increment_message_count` RPC.  Both are mocked at module boundary.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Declare mock holders so tests can reconfigure them in beforeEach
// ---------------------------------------------------------------------------

let mockMaybySingle = vi.fn();
let mockRpc = vi.fn();

// Build a chainable select mock that always terminates with maybySingle
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildSelectChain(): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: Record<string, any> = {};
  const identity = () => chain;

  chain.eq = vi.fn(identity);
  chain.gte = vi.fn(identity);
  chain.order = vi.fn(identity);
  chain.limit = vi.fn(identity);
  chain.maybeSingle = mockMaybySingle;

  return chain;
}

let mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  supabaseServer: {
    get from() {
      return mockFrom;
    },
    get rpc() {
      return mockRpc;
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
import { checkRateLimit, recordMessage } from '@/lib/rise/rate-limit';

// ---------------------------------------------------------------------------
// checkRateLimit
// ---------------------------------------------------------------------------

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockMaybySingle = vi.fn();
    // Re-wire mockFrom to return a fresh chain each call
    mockFrom.mockImplementation(() => {
      const chain = buildSelectChain();
      // Override maybeSingle with the current mockMaybySingle reference
      chain.maybeSingle = mockMaybySingle;
      return { select: vi.fn(() => chain) };
    });
  });

  it('returns allowed:true remaining:60 when no active window exists', async () => {
    mockMaybySingle.mockResolvedValue({ data: null, error: null });

    const result = await checkRateLimit('user-1');
    expect(result).toEqual({ allowed: true, remaining: 60 });
  });

  it('returns allowed:true remaining:30 when message_count is 30', async () => {
    mockMaybySingle.mockResolvedValue({
      data: { id: 'row-1', message_count: 30, window_start: new Date().toISOString() },
      error: null,
    });

    const result = await checkRateLimit('user-1');
    expect(result).toEqual({ allowed: true, remaining: 30 });
  });

  it('returns allowed:false remaining:0 when message_count equals 60', async () => {
    mockMaybySingle.mockResolvedValue({
      data: { id: 'row-1', message_count: 60, window_start: new Date().toISOString() },
      error: null,
    });

    const result = await checkRateLimit('user-1');
    expect(result).toEqual({ allowed: false, remaining: 0 });
  });

  it('returns allowed:false remaining:0 when message_count exceeds 60 (count=65)', async () => {
    mockMaybySingle.mockResolvedValue({
      data: { id: 'row-1', message_count: 65, window_start: new Date().toISOString() },
      error: null,
    });

    const result = await checkRateLimit('user-1');
    expect(result).toEqual({ allowed: false, remaining: 0 });
  });

  it('throws when supabase returns an error', async () => {
    mockMaybySingle.mockResolvedValue({
      data: null,
      error: { message: 'db connection failed' },
    });

    await expect(checkRateLimit('user-1')).rejects.toThrow(
      'Failed to query rate_limit_tracking: db connection failed'
    );
  });
});

// ---------------------------------------------------------------------------
// recordMessage
// ---------------------------------------------------------------------------

describe('recordMessage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('calls supabaseServer.rpc with increment_message_count and p_user_id', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });

    await recordMessage('user-abc');

    expect(mockRpc).toHaveBeenCalledOnce();
    expect(mockRpc).toHaveBeenCalledWith('increment_message_count', {
      p_user_id: 'user-abc',
    });
  });

  it('resolves without throwing when rpc succeeds', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });

    await expect(recordMessage('user-abc')).resolves.toBeUndefined();
  });

  it('throws when rpc returns an error', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'rpc failed' },
    });

    await expect(recordMessage('user-abc')).rejects.toThrow(
      'Failed to record message: rpc failed'
    );
  });
});
