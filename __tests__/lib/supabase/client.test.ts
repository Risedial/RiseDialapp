/**
 * Unit tests for lib/supabase/client.ts
 *
 * Verifies that:
 *  - The module exports `supabaseClient` (not `supabaseServer`)
 *  - `createClient` is called with NEXT_PUBLIC_SUPABASE_URL and
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY from process.env (NOT from lib/env.ts)
 *  - `createClient` is called with auth: { persistSession: true, autoRefreshToken: true }
 *  - The module does NOT import from lib/env.ts (reads process.env directly)
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';

// ---------------------------------------------------------------------------
// The env vars are already injected by vitest.config.ts test.env:
//   NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
// We do NOT set them here — the test config is the single source of truth.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Mock @supabase/supabase-js so no real network calls are made
// ---------------------------------------------------------------------------

const mockCreateClient = vi.fn();
const mockSupabaseClient = { auth: {}, from: vi.fn() };

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => {
    mockCreateClient(...args);
    return mockSupabaseClient;
  },
}));

// ---------------------------------------------------------------------------
// Import the module under test AFTER mocks are declared
// ---------------------------------------------------------------------------

// We use a dynamic import inside beforeAll so that mock factory is registered
// before the module is loaded. With vi.mock hoisting this is equivalent to a
// static import, but the dynamic form makes the ordering explicit.
let supabaseClientModule: typeof import('@/lib/supabase/client');

beforeAll(async () => {
  supabaseClientModule = await import('@/lib/supabase/client');
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('lib/supabase/client', () => {
  it('exports supabaseClient', () => {
    expect(supabaseClientModule.supabaseClient).toBeDefined();
  });

  it('does NOT export supabaseServer', () => {
    // The browser client file must not re-export the server singleton
    expect((supabaseClientModule as Record<string, unknown>).supabaseServer).toBeUndefined();
  });

  it('called createClient once on module load', () => {
    expect(mockCreateClient).toHaveBeenCalledTimes(1);
  });

  it('called createClient with NEXT_PUBLIC_SUPABASE_URL', () => {
    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      expect.any(String),
      expect.any(Object),
    );
  });

  it('called createClient with NEXT_PUBLIC_SUPABASE_ANON_KEY', () => {
    expect(mockCreateClient).toHaveBeenCalledWith(
      expect.any(String),
      'test-anon-key',
      expect.any(Object),
    );
  });

  it('called createClient with auth.persistSession: true', () => {
    const callArgs = mockCreateClient.mock.calls[0];
    const options = callArgs[2] as { auth: { persistSession: boolean; autoRefreshToken: boolean } };
    expect(options.auth.persistSession).toBe(true);
  });

  it('called createClient with auth.autoRefreshToken: true', () => {
    const callArgs = mockCreateClient.mock.calls[0];
    const options = callArgs[2] as { auth: { persistSession: boolean; autoRefreshToken: boolean } };
    expect(options.auth.autoRefreshToken).toBe(true);
  });

  it('supabaseClient is the object returned by createClient', () => {
    expect(supabaseClientModule.supabaseClient).toBe(mockSupabaseClient);
  });
});

// ---------------------------------------------------------------------------
// Verify source file does not import from lib/env.ts
// ---------------------------------------------------------------------------

describe('lib/supabase/client — source file constraints', () => {
  it('does NOT import from lib/env (reads process.env directly)', async () => {
    // Read the source file content at test time to verify the import constraint.
    // We use a Node.js readFileSync call since this is a server-side test file.
    const fs = await import('fs');
    const path = await import('path');

    const sourceFilePath = path.resolve(
      process.cwd(),
      'lib',
      'supabase',
      'client.ts',
    );

    const sourceContent = fs.readFileSync(sourceFilePath, 'utf-8');

    // The file must not contain any import of lib/env
    expect(sourceContent).not.toMatch(/from\s+['"]@?\/?(lib\/)?env['"]/);
    expect(sourceContent).not.toMatch(/require\s*\(\s*['"]@?\/?(lib\/)?env['"]\s*\)/);
  });
});
