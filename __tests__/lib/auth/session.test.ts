/**
 * Unit tests for lib/auth/session.ts
 *
 * The module uses:
 *  - crypto.subtle (Web Crypto API) — available in jsdom
 *  - next/server NextResponse — mocked below
 *  - @/lib/env — mocked to provide a stable JWT_SECRET
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock @/lib/env so the module under test never touches process.env directly
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
// Mock next/server — provide a MockNextResponse with a MockCookies store
// ---------------------------------------------------------------------------
class MockCookies {
  private store: Map<string, { value: string; options: Record<string, unknown> }> = new Map();

  set(
    name: string,
    value: string,
    options: Record<string, unknown> = {}
  ): void {
    this.store.set(name, { value, options });
  }

  get(name: string) {
    return this.store.get(name);
  }

  getAll() {
    return Array.from(this.store.entries()).map(([name, entry]) => ({
      name,
      ...entry,
    }));
  }
}

class MockNextResponse {
  cookies: MockCookies;

  constructor() {
    this.cookies = new MockCookies();
  }
}

vi.mock('next/server', () => ({
  NextResponse: MockNextResponse,
}));

// ---------------------------------------------------------------------------
// Import the module under test AFTER mocks are declared
// ---------------------------------------------------------------------------
import {
  createSession,
  verifySession,
  setSessionCookie,
  clearSessionCookie,
} from '@/lib/auth/session';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function base64urlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (padded.length % 4)) % 4;
  return atob(padded + '='.repeat(padLength));
}

// ---------------------------------------------------------------------------
// createSession
// ---------------------------------------------------------------------------

describe('createSession', () => {
  it('returns a 3-part dot-separated JWT', async () => {
    const token = await createSession('user-123', 'active');
    const parts = token.split('.');
    expect(parts).toHaveLength(3);
  });

  it('encodes the HS256/JWT header in part[0]', async () => {
    const token = await createSession('user-123', 'active');
    const [headerPart] = token.split('.');
    const decoded = JSON.parse(base64urlDecode(headerPart));
    expect(decoded).toEqual({ alg: 'HS256', typ: 'JWT' });
  });

  it('embeds user_id in the payload', async () => {
    const token = await createSession('user-abc', 'active');
    const payloadPart = token.split('.')[1];
    const decoded = JSON.parse(base64urlDecode(payloadPart));
    expect(decoded.user_id).toBe('user-abc');
  });

  it('embeds subscription_status in the payload', async () => {
    const token = await createSession('user-123', 'lapsed');
    const payloadPart = token.split('.')[1];
    const decoded = JSON.parse(base64urlDecode(payloadPart));
    expect(decoded.subscription_status).toBe('lapsed');
  });

  it('embeds iat and exp claims with exp = iat + 2592000', async () => {
    const before = Math.floor(Date.now() / 1000);
    const token = await createSession('user-123', 'active');
    const after = Math.floor(Date.now() / 1000);

    const payloadPart = token.split('.')[1];
    const decoded = JSON.parse(base64urlDecode(payloadPart));

    expect(decoded.iat).toBeGreaterThanOrEqual(before);
    expect(decoded.iat).toBeLessThanOrEqual(after);
    expect(decoded.exp).toBe(decoded.iat + 2592000);
  });
});

// ---------------------------------------------------------------------------
// verifySession
// ---------------------------------------------------------------------------

describe('verifySession', () => {
  it('returns the payload for a valid token', async () => {
    const token = await createSession('user-xyz', 'active');
    const result = await verifySession(token);
    expect(result).not.toBeNull();
    expect(result!.user_id).toBe('user-xyz');
    expect(result!.subscription_status).toBe('active');
  });

  it('returns null for a tampered signature', async () => {
    const token = await createSession('user-123', 'active');
    const parts = token.split('.');
    // Flip last char of signature
    const badSig =
      parts[2].slice(0, -1) + (parts[2].slice(-1) === 'a' ? 'b' : 'a');
    const tampered = `${parts[0]}.${parts[1]}.${badSig}`;
    const result = await verifySession(tampered);
    expect(result).toBeNull();
  });

  it('returns null for fewer than 3 parts (2 parts)', async () => {
    const result = await verifySession('header.payload');
    expect(result).toBeNull();
  });

  it('returns null for more than 3 parts (4 parts)', async () => {
    const token = await createSession('user-123', 'active');
    const result = await verifySession(token + '.extra');
    expect(result).toBeNull();
  });

  it('returns null for a garbage string', async () => {
    const result = await verifySession('not.a.jwt');
    expect(result).toBeNull();
  });

  it('returns null for an entirely empty string', async () => {
    const result = await verifySession('');
    expect(result).toBeNull();
  });

  it('returns null for an expired token', async () => {
    // Freeze time so we can craft an already-expired token
    const now = Math.floor(Date.now() / 1000);

    // Create a valid token at "now"
    const token = await createSession('user-expired', 'active');

    // Advance system time past the 30-day expiry
    vi.setSystemTime(new Date((now + 2592001) * 1000));

    try {
      const result = await verifySession(token);
      expect(result).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});

// ---------------------------------------------------------------------------
// setSessionCookie
// ---------------------------------------------------------------------------

describe('setSessionCookie', () => {
  it('sets the risedial_session cookie with the token value', async () => {
    const response = new MockNextResponse() as unknown as import('next/server').NextResponse;
    const token = await createSession('user-123', 'active');
    setSessionCookie(response, token);

    const entry = (response.cookies as unknown as MockCookies).get('risedial_session');
    expect(entry).toBeDefined();
    expect(entry!.value).toBe(token);
  });

  it('sets httpOnly: true', async () => {
    const response = new MockNextResponse() as unknown as import('next/server').NextResponse;
    setSessionCookie(response, 'sometoken');
    const entry = (response.cookies as unknown as MockCookies).get('risedial_session');
    expect(entry!.options.httpOnly).toBe(true);
  });

  it('sets sameSite: strict', async () => {
    const response = new MockNextResponse() as unknown as import('next/server').NextResponse;
    setSessionCookie(response, 'sometoken');
    const entry = (response.cookies as unknown as MockCookies).get('risedial_session');
    expect(entry!.options.sameSite).toBe('strict');
  });

  it('sets secure: true', async () => {
    const response = new MockNextResponse() as unknown as import('next/server').NextResponse;
    setSessionCookie(response, 'sometoken');
    const entry = (response.cookies as unknown as MockCookies).get('risedial_session');
    expect(entry!.options.secure).toBe(true);
  });

  it('sets maxAge: 2592000', async () => {
    const response = new MockNextResponse() as unknown as import('next/server').NextResponse;
    setSessionCookie(response, 'sometoken');
    const entry = (response.cookies as unknown as MockCookies).get('risedial_session');
    expect(entry!.options.maxAge).toBe(2592000);
  });

  it('sets path: /', async () => {
    const response = new MockNextResponse() as unknown as import('next/server').NextResponse;
    setSessionCookie(response, 'sometoken');
    const entry = (response.cookies as unknown as MockCookies).get('risedial_session');
    expect(entry!.options.path).toBe('/');
  });
});

// ---------------------------------------------------------------------------
// clearSessionCookie
// ---------------------------------------------------------------------------

describe('clearSessionCookie', () => {
  it('sets risedial_session to empty string', () => {
    const response = new MockNextResponse() as unknown as import('next/server').NextResponse;
    clearSessionCookie(response);
    const entry = (response.cookies as unknown as MockCookies).get('risedial_session');
    expect(entry).toBeDefined();
    expect(entry!.value).toBe('');
  });

  it('sets maxAge: 0 to expire the cookie', () => {
    const response = new MockNextResponse() as unknown as import('next/server').NextResponse;
    clearSessionCookie(response);
    const entry = (response.cookies as unknown as MockCookies).get('risedial_session');
    expect(entry!.options.maxAge).toBe(0);
  });

  it('still sets httpOnly: true', () => {
    const response = new MockNextResponse() as unknown as import('next/server').NextResponse;
    clearSessionCookie(response);
    const entry = (response.cookies as unknown as MockCookies).get('risedial_session');
    expect(entry!.options.httpOnly).toBe(true);
  });

  it('still sets sameSite: strict', () => {
    const response = new MockNextResponse() as unknown as import('next/server').NextResponse;
    clearSessionCookie(response);
    const entry = (response.cookies as unknown as MockCookies).get('risedial_session');
    expect(entry!.options.sameSite).toBe('strict');
  });

  it('still sets secure: true', () => {
    const response = new MockNextResponse() as unknown as import('next/server').NextResponse;
    clearSessionCookie(response);
    const entry = (response.cookies as unknown as MockCookies).get('risedial_session');
    expect(entry!.options.secure).toBe(true);
  });

  it('still sets path: /', () => {
    const response = new MockNextResponse() as unknown as import('next/server').NextResponse;
    clearSessionCookie(response);
    const entry = (response.cookies as unknown as MockCookies).get('risedial_session');
    expect(entry!.options.path).toBe('/');
  });
});
