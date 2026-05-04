/**
 * Integration tests for app/api/webhooks/stripe/route.ts
 *
 * The route is thin: it delegates signature verification to
 * verifyWebhookSignature and event routing to routeWebhookEvent (both from
 * @/lib/stripe/webhooks). All external dependencies are mocked.
 *
 * vi.mock() is hoisted by vitest, so mock classes and vi.fn() handles are
 * declared with vi.hoisted() to ensure they exist when factories run.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Hoisted mock handles
// ---------------------------------------------------------------------------

const {
  MockNextResponse,
  MockNextRequest,
  mockVerifyWebhookSignature,
  mockRouteWebhookEvent,
} = vi.hoisted(() => {
  class HoistedNextResponse {
    private _body: unknown;
    readonly status: number;

    constructor(body: unknown, init?: { status?: number }) {
      this._body = body;
      this.status = init?.status ?? 200;
    }

    async json(): Promise<unknown> {
      return this._body;
    }

    static json(body: unknown, init?: { status?: number }): HoistedNextResponse {
      return new HoistedNextResponse(body, init);
    }
  }

  class HoistedNextRequest {
    private _text: string;
    headers: { get: (name: string) => string | null };

    constructor(opts: { body?: string; signatureHeader?: string | null } = {}) {
      this._text = opts.body ?? 'raw-stripe-body';
      const sig =
        opts.signatureHeader !== undefined ? opts.signatureHeader : 'stripe-sig-value';
      this.headers = {
        get: (name: string) => (name === 'stripe-signature' ? sig : null),
      };
    }

    async text(): Promise<string> {
      return this._text;
    }
  }

  return {
    MockNextResponse: HoistedNextResponse,
    MockNextRequest: HoistedNextRequest,
    mockVerifyWebhookSignature: vi.fn(),
    mockRouteWebhookEvent: vi.fn(),
  };
});

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock('next/server', () => ({
  NextResponse: MockNextResponse,
  NextRequest: MockNextRequest,
}));

vi.mock('@/lib/stripe/webhooks', () => ({
  verifyWebhookSignature: (...args: unknown[]) => mockVerifyWebhookSignature(...args),
  routeWebhookEvent: (...args: unknown[]) => mockRouteWebhookEvent(...args),
}));

// ---------------------------------------------------------------------------
// Import module under test AFTER mocks
// ---------------------------------------------------------------------------

import { POST } from '@/app/api/webhooks/stripe/route';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeFakeEvent(type: string, eventId = 'evt_test_001') {
  return { id: eventId, type, data: { object: {} } };
}

function makeRequest(
  opts: { body?: string; signatureHeader?: string | null } = {},
): InstanceType<typeof MockNextRequest> {
  return new MockNextRequest(opts);
}

// ---------------------------------------------------------------------------
// Reset mocks before each test
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.resetAllMocks();
  mockVerifyWebhookSignature.mockReturnValue(makeFakeEvent('checkout.session.completed'));
  mockRouteWebhookEvent.mockResolvedValue(undefined);
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/webhooks/stripe', () => {
  // ── Missing signature header ───────────────────────────────────────────────

  it('returns 400 when stripe-signature header is missing', async () => {
    const req = makeRequest({ signatureHeader: null }) as unknown as import('next/server').NextRequest;

    const res = (await POST(req)) as unknown as InstanceType<typeof MockNextResponse>;

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('Missing stripe-signature header');
  });

  // ── Signature verification failure ────────────────────────────────────────

  it('returns 400 when webhook signature verification fails', async () => {
    mockVerifyWebhookSignature.mockImplementation(() => {
      throw new Error('Webhook signature verification failed');
    });

    const req = makeRequest() as unknown as import('next/server').NextRequest;

    const res = (await POST(req)) as unknown as InstanceType<typeof MockNextResponse>;

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('Webhook signature verification failed');
  });

  // ── Happy path ────────────────────────────────────────────────────────────

  it('returns 200 { received: true } on successful processing', async () => {
    const event = makeFakeEvent('checkout.session.completed');
    mockVerifyWebhookSignature.mockReturnValue(event);
    mockRouteWebhookEvent.mockResolvedValue(undefined);

    const req = makeRequest() as unknown as import('next/server').NextRequest;

    const res = (await POST(req)) as unknown as InstanceType<typeof MockNextResponse>;

    expect(res.status).toBe(200);
    const body = (await res.json()) as { received: boolean };
    expect(body).toEqual({ received: true });
  });

  // ── Per-event-type routing ─────────────────────────────────────────────────

  it('returns 200 for checkout.session.completed event', async () => {
    const event = makeFakeEvent('checkout.session.completed');
    mockVerifyWebhookSignature.mockReturnValue(event);

    const req = makeRequest() as unknown as import('next/server').NextRequest;
    const res = (await POST(req)) as unknown as InstanceType<typeof MockNextResponse>;

    expect(res.status).toBe(200);
    expect(mockRouteWebhookEvent).toHaveBeenCalledWith(event);
    const body = (await res.json()) as { received: boolean };
    expect(body.received).toBe(true);
  });

  it('returns 200 for customer.subscription.updated event', async () => {
    const event = makeFakeEvent('customer.subscription.updated');
    mockVerifyWebhookSignature.mockReturnValue(event);

    const req = makeRequest() as unknown as import('next/server').NextRequest;
    const res = (await POST(req)) as unknown as InstanceType<typeof MockNextResponse>;

    expect(res.status).toBe(200);
    expect(mockRouteWebhookEvent).toHaveBeenCalledWith(event);
    const body = (await res.json()) as { received: boolean };
    expect(body.received).toBe(true);
  });

  it('returns 200 for customer.subscription.deleted event', async () => {
    const event = makeFakeEvent('customer.subscription.deleted');
    mockVerifyWebhookSignature.mockReturnValue(event);

    const req = makeRequest() as unknown as import('next/server').NextRequest;
    const res = (await POST(req)) as unknown as InstanceType<typeof MockNextResponse>;

    expect(res.status).toBe(200);
    expect(mockRouteWebhookEvent).toHaveBeenCalledWith(event);
    const body = (await res.json()) as { received: boolean };
    expect(body.received).toBe(true);
  });

  it('returns 200 for invoice.payment_failed event', async () => {
    const event = makeFakeEvent('invoice.payment_failed');
    mockVerifyWebhookSignature.mockReturnValue(event);

    const req = makeRequest() as unknown as import('next/server').NextRequest;
    const res = (await POST(req)) as unknown as InstanceType<typeof MockNextResponse>;

    expect(res.status).toBe(200);
    expect(mockRouteWebhookEvent).toHaveBeenCalledWith(event);
    const body = (await res.json()) as { received: boolean };
    expect(body.received).toBe(true);
  });

  it('returns 200 for an unhandled event type (silently ignored)', async () => {
    const event = makeFakeEvent('payment_intent.created');
    mockVerifyWebhookSignature.mockReturnValue(event);

    const req = makeRequest() as unknown as import('next/server').NextRequest;
    const res = (await POST(req)) as unknown as InstanceType<typeof MockNextResponse>;

    expect(res.status).toBe(200);
    const body = (await res.json()) as { received: boolean };
    expect(body.received).toBe(true);
  });

  // ── Outer catch: routeWebhookEvent throws ────────────────────────────────

  it('returns 200 { received: true } even when routeWebhookEvent throws', async () => {
    const event = makeFakeEvent('customer.subscription.updated');
    mockVerifyWebhookSignature.mockReturnValue(event);
    mockRouteWebhookEvent.mockRejectedValue(new Error('DB connection error'));

    const req = makeRequest() as unknown as import('next/server').NextRequest;
    const res = (await POST(req)) as unknown as InstanceType<typeof MockNextResponse>;

    expect(res.status).toBe(200);
    const body = (await res.json()) as { received: boolean };
    expect(body).toEqual({ received: true });
  });

  // ── verifyWebhookSignature receives correct args ──────────────────────────

  it('passes raw body and signature to verifyWebhookSignature', async () => {
    const event = makeFakeEvent('checkout.session.completed');
    mockVerifyWebhookSignature.mockReturnValue(event);

    const req = makeRequest({
      body: 'stripe-raw-payload',
      signatureHeader: 'whsec_abc123',
    }) as unknown as import('next/server').NextRequest;

    await POST(req);

    expect(mockVerifyWebhookSignature).toHaveBeenCalledWith(
      'stripe-raw-payload',
      'whsec_abc123',
    );
  });
});
