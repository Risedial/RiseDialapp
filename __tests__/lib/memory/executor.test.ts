/**
 * Unit tests for lib/memory/executor.ts
 *
 * Tests that executeCompressionAsync:
 *  - Never throws under any condition
 *  - Selects the correct model based on hasPremium flag
 *  - Dispatches generateInitialProfile vs patchMemoryProfile correctly
 *  - Retries exactly 3 times with delays before giving up
 *  - Returns immediately on success without extra retries
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock @/lib/env (transitively required by any module importing supabase/server)
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
// Declare mock functions for the three dependency modules
// ---------------------------------------------------------------------------

const mockCheckCompressionTrigger = vi.fn();
const mockGenerateInitialProfile = vi.fn();
const mockPatchMemoryProfile = vi.fn();

vi.mock('@/lib/memory/trigger', () => ({
  checkCompressionTrigger: (...args: unknown[]) => mockCheckCompressionTrigger(...args),
}));

vi.mock('@/lib/memory/compress', () => ({
  generateInitialProfile: (...args: unknown[]) => mockGenerateInitialProfile(...args),
}));

vi.mock('@/lib/memory/patch', () => ({
  patchMemoryProfile: (...args: unknown[]) => mockPatchMemoryProfile(...args),
}));

// ---------------------------------------------------------------------------
// Import the module under test AFTER mocks are declared
// ---------------------------------------------------------------------------
import { executeCompressionAsync } from '@/lib/memory/executor';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NO_COMPRESS = { shouldCompress: false, isInitial: false, isPatch: false };
const INITIAL_COMPRESS = { shouldCompress: true, isInitial: true, isPatch: false };
const PATCH_COMPRESS = { shouldCompress: false, isInitial: false, isPatch: true };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('executeCompressionAsync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Basic no-op cases ────────────────────────────────────────────────────

  it('resolves undefined when no compression is needed', async () => {
    mockCheckCompressionTrigger.mockResolvedValue(NO_COMPRESS);

    const promise = executeCompressionAsync('chat-1', 'user-1', false);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBeUndefined();
    expect(mockGenerateInitialProfile).not.toHaveBeenCalled();
    expect(mockPatchMemoryProfile).not.toHaveBeenCalled();
  });

  it('resolves undefined when trigger check throws', async () => {
    mockCheckCompressionTrigger.mockRejectedValue(new Error('trigger error'));

    const promise = executeCompressionAsync('chat-1', 'user-1', false);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBeUndefined();
    expect(mockGenerateInitialProfile).not.toHaveBeenCalled();
    expect(mockPatchMemoryProfile).not.toHaveBeenCalled();
  });

  // ── Initial compression ──────────────────────────────────────────────────

  it('resolves undefined when initial compression succeeds', async () => {
    mockCheckCompressionTrigger.mockResolvedValue(INITIAL_COMPRESS);
    mockGenerateInitialProfile.mockResolvedValue(undefined);

    const promise = executeCompressionAsync('chat-1', 'user-1', false);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBeUndefined();
    expect(mockGenerateInitialProfile).toHaveBeenCalledTimes(1);
    expect(mockGenerateInitialProfile).toHaveBeenCalledWith('chat-1', 'user-1', 'gpt-4o-mini');
  });

  it('resolves undefined when patch compression succeeds', async () => {
    mockCheckCompressionTrigger.mockResolvedValue({ shouldCompress: true, isInitial: false, isPatch: true });
    mockPatchMemoryProfile.mockResolvedValue(undefined);

    const promise = executeCompressionAsync('chat-1', 'user-1', false);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBeUndefined();
    expect(mockPatchMemoryProfile).toHaveBeenCalledTimes(1);
    expect(mockPatchMemoryProfile).toHaveBeenCalledWith('chat-1', 'user-1', 'gpt-4o-mini');
  });

  // ── Model selection ──────────────────────────────────────────────────────

  it('uses gpt-4o when hasPremium is true (initial compression)', async () => {
    mockCheckCompressionTrigger.mockResolvedValue(INITIAL_COMPRESS);
    mockGenerateInitialProfile.mockResolvedValue(undefined);

    const promise = executeCompressionAsync('chat-1', 'user-1', true);
    await vi.runAllTimersAsync();
    await promise;

    expect(mockGenerateInitialProfile).toHaveBeenCalledWith('chat-1', 'user-1', 'gpt-4o');
  });

  it('uses gpt-4o-mini when hasPremium is false (initial compression)', async () => {
    mockCheckCompressionTrigger.mockResolvedValue(INITIAL_COMPRESS);
    mockGenerateInitialProfile.mockResolvedValue(undefined);

    const promise = executeCompressionAsync('chat-1', 'user-1', false);
    await vi.runAllTimersAsync();
    await promise;

    expect(mockGenerateInitialProfile).toHaveBeenCalledWith('chat-1', 'user-1', 'gpt-4o-mini');
  });

  it('uses gpt-4o-mini for patch compression when hasPremium is false', async () => {
    mockCheckCompressionTrigger.mockResolvedValue({ shouldCompress: true, isInitial: false, isPatch: true });
    mockPatchMemoryProfile.mockResolvedValue(undefined);

    const promise = executeCompressionAsync('chat-1', 'user-1', false);
    await vi.runAllTimersAsync();
    await promise;

    expect(mockPatchMemoryProfile).toHaveBeenCalledWith('chat-1', 'user-1', 'gpt-4o-mini');
  });

  // ── Retry logic: all 3 attempts fail ────────────────────────────────────

  it('resolves undefined after all 3 compression attempts fail (hasPremium=false)', async () => {
    mockCheckCompressionTrigger.mockResolvedValue(INITIAL_COMPRESS);
    mockGenerateInitialProfile.mockRejectedValue(new Error('compression fail'));

    const promise = executeCompressionAsync('chat-1', 'user-1', false);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBeUndefined();
    expect(mockGenerateInitialProfile).toHaveBeenCalledTimes(3);
  });

  it('resolves undefined after all 3 compression attempts fail (hasPremium=true, uses gpt-4o)', async () => {
    mockCheckCompressionTrigger.mockResolvedValue(INITIAL_COMPRESS);
    mockGenerateInitialProfile.mockRejectedValue(new Error('compression fail'));

    const promise = executeCompressionAsync('chat-1', 'user-1', true);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBeUndefined();
    expect(mockGenerateInitialProfile).toHaveBeenCalledTimes(3);
    expect(mockGenerateInitialProfile).toHaveBeenCalledWith('chat-1', 'user-1', 'gpt-4o');
  });

  it('resolves undefined after all 3 patch attempts fail (non-premium, uses gpt-4o-mini)', async () => {
    mockCheckCompressionTrigger.mockResolvedValue({ shouldCompress: true, isInitial: false, isPatch: true });
    mockPatchMemoryProfile.mockRejectedValue(new Error('patch fail'));

    const promise = executeCompressionAsync('chat-1', 'user-1', false);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBeUndefined();
    expect(mockPatchMemoryProfile).toHaveBeenCalledTimes(3);
    expect(mockPatchMemoryProfile).toHaveBeenCalledWith('chat-1', 'user-1', 'gpt-4o-mini');
  });

  it('retries exactly 3 times before giving up', async () => {
    mockCheckCompressionTrigger.mockResolvedValue(INITIAL_COMPRESS);
    mockGenerateInitialProfile.mockRejectedValue(new Error('always fails'));

    const promise = executeCompressionAsync('chat-1', 'user-1', false);
    await vi.runAllTimersAsync();
    await promise;

    expect(mockGenerateInitialProfile).toHaveBeenCalledTimes(3);
  });

  // ── Retry logic: success on second attempt ────────────────────────────────

  it('succeeds on second attempt and does not call compression a third time', async () => {
    mockCheckCompressionTrigger.mockResolvedValue(INITIAL_COMPRESS);
    mockGenerateInitialProfile
      .mockRejectedValueOnce(new Error('first attempt fail'))
      .mockResolvedValueOnce(undefined);

    const promise = executeCompressionAsync('chat-1', 'user-1', false);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBeUndefined();
    expect(mockGenerateInitialProfile).toHaveBeenCalledTimes(2);
  });

  // ── Unexpected outer error ────────────────────────────────────────────────

  it('resolves undefined even if an unexpected outer error occurs', async () => {
    // Make checkCompressionTrigger throw a non-Error value to simulate an
    // unexpected outer-catch scenario
    mockCheckCompressionTrigger.mockImplementation(() => {
      throw 'unexpected string thrown';
    });

    const promise = executeCompressionAsync('chat-1', 'user-1', false);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBeUndefined();
  });
});
