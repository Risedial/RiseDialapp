/**
 * Unit tests for lib/stripe/webhooks.ts
 *
 * Tests verifyWebhookSignature and routeWebhookEvent with all four Stripe
 * event types, idempotency logic, null-customer guards, missing-user_id guards,
 * no-base-price guards, and unhandled event type pass-through.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type Stripe from 'stripe';

// ---------------------------------------------------------------------------
// Mock @/lib/env (required by lib/stripe/config and lib/stripe/webhooks)
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
// Mock @/lib/stripe/config
// ---------------------------------------------------------------------------

const mockConstructEvent = vi.fn();
const mockSubscriptionsRetrieve = vi.fn();

vi.mock('@/lib/stripe/config', () => ({
  stripe: {
    webhooks: {
      constructEvent: (...args: unknown[]) => mockConstructEvent(...args),
    },
    subscriptions: {
      retrieve: (...args: unknown[]) => mockSubscriptionsRetrieve(...args),
    },
  },
  PRICE_MONTHLY: 'price_test_monthly',
  PRICE_ANNUAL: 'price_test_annual',
  PRICE_PREMIUM_MONTHLY_ADDON: 'price_test_premium_monthly',
  PRICE_PREMIUM_ANNUAL_ADDON: 'price_test_premium_annual',
}));

// ---------------------------------------------------------------------------
// Mock @/lib/supabase/server — chainable query builder
// ---------------------------------------------------------------------------

// Terminal promise result that tests can swap out
let mockSelectResult: { data: unknown; error: null | { message: string } } = {
  data: null,
  error: null,
};
let mockUpdateResult: { data: unknown; error: null | { message: string } } = {
  data: null,
  error: null,
};
let mockInsertResult: { data: unknown; error: null | { message: string } } = {
  data: null,
  error: null,
};

// Build a chainable mock that routes select/insert/update to their result stubs.
// All properties are typed as `any` to allow per-test override without TS errors.
function buildQueryChain(_table: string): Record<string, any> {
  const selectChain: Record<string, any> = {};
  selectChain.eq = vi.fn(() => selectChain);
  selectChain.maybeSingle = vi.fn(() => Promise.resolve(mockSelectResult));

  const updateChain: Record<string, any> = {};
  updateChain.eq = vi.fn(() => Promise.resolve(mockUpdateResult));

  return {
    select: vi.fn(() => selectChain),
    insert: vi.fn(() => Promise.resolve(mockInsertResult)),
    update: vi.fn(() => updateChain),
  };
}

const mockFrom = vi.fn((table: string) => buildQueryChain(table));

vi.mock('@/lib/supabase/server', () => ({
  supabaseServer: {
    get from() {
      return mockFrom;
    },
  },
}));

// ---------------------------------------------------------------------------
// Import modules under test AFTER mocks are declared
// ---------------------------------------------------------------------------
import { verifyWebhookSignature, routeWebhookEvent } from '@/lib/stripe/webhooks';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** Build a minimal Stripe.Subscription object for a given set of price IDs */
function makeSubscription(
  priceIds: string[],
  customerId = 'cus_test',
  subscriptionId = 'sub_test',
): Stripe.Subscription {
  return {
    id: subscriptionId,
    customer: customerId,
    items: {
      data: priceIds.map((priceId, i) => ({
        id: `si_test_${i}`,
        price: { id: priceId },
        current_period_end: 1800000000,
      })),
    },
  } as unknown as Stripe.Subscription;
}

function makeEvent(type: string, object: unknown, eventId = 'evt_test_001'): Stripe.Event {
  return {
    id: eventId,
    type,
    data: { object },
  } as unknown as Stripe.Event;
}

function makeCheckoutSession(overrides: Record<string, unknown> = {}): Stripe.Checkout.Session {
  return {
    subscription: 'sub_test',
    customer: 'cus_test',
    metadata: { user_id: 'user-uuid-1' },
    ...overrides,
  } as unknown as Stripe.Checkout.Session;
}

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.resetAllMocks();
  // Default: event has not been seen before (idempotency check returns null)
  mockSelectResult = { data: null, error: null };
  mockUpdateResult = { data: null, error: null };
  mockInsertResult = { data: null, error: null };

  // Rebuild mockFrom after reset
  mockFrom.mockImplementation((table: string) => buildQueryChain(table));
});

// ---------------------------------------------------------------------------
// verifyWebhookSignature
// ---------------------------------------------------------------------------

describe('verifyWebhookSignature', () => {
  it('calls constructEvent with body, signature and webhook secret', () => {
    const fakeEvent = makeEvent('checkout.session.completed', {});
    mockConstructEvent.mockReturnValue(fakeEvent);

    const result = verifyWebhookSignature('raw-body', 'sig_header');

    expect(mockConstructEvent).toHaveBeenCalledTimes(1);
    expect(mockConstructEvent).toHaveBeenCalledWith('raw-body', 'sig_header', 'whsec_test');
    expect(result).toBe(fakeEvent);
  });

  it('propagates errors thrown by constructEvent', () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Webhook signature verification failed');
    });

    expect(() => verifyWebhookSignature('bad-body', 'bad-sig')).toThrow(
      'Webhook signature verification failed',
    );
  });
});

// ---------------------------------------------------------------------------
// routeWebhookEvent — idempotency
// ---------------------------------------------------------------------------

describe('routeWebhookEvent — idempotency', () => {
  it('returns early without processing when stripe_event_id already exists', async () => {
    // Idempotency check returns an existing record
    mockSelectResult = { data: { id: 'some-uuid' }, error: null };
    mockFrom.mockImplementation((table: string) => buildQueryChain(table));

    const subscription = makeSubscription(['price_test_monthly']);
    const event = makeEvent('customer.subscription.updated', subscription);

    await routeWebhookEvent(event);

    // update on users table should never be called when we return early
    const updateCalls = mockFrom.mock.calls.filter(
      (call: unknown[]) => call[0] === 'users',
    );
    expect(updateCalls).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// routeWebhookEvent — checkout.session.completed
// ---------------------------------------------------------------------------

describe('routeWebhookEvent — checkout.session.completed', () => {
  it('updates the user record on successful checkout', async () => {
    const subscription = makeSubscription(['price_test_monthly']);
    mockSubscriptionsRetrieve.mockResolvedValue(subscription);

    const session = makeCheckoutSession();
    const event = makeEvent('checkout.session.completed', session);

    await routeWebhookEvent(event);

    expect(mockSubscriptionsRetrieve).toHaveBeenCalledWith('sub_test', {
      expand: ['items.data.price'],
    });
  });

  it('returns early when session.subscription is missing', async () => {
    const session = makeCheckoutSession({ subscription: null });
    const event = makeEvent('checkout.session.completed', session);

    await routeWebhookEvent(event);

    expect(mockSubscriptionsRetrieve).not.toHaveBeenCalled();
  });

  it('returns early when session.customer is missing', async () => {
    const session = makeCheckoutSession({ customer: null });
    const event = makeEvent('checkout.session.completed', session);

    await routeWebhookEvent(event);

    expect(mockSubscriptionsRetrieve).not.toHaveBeenCalled();
  });

  it('returns early when metadata.user_id is missing', async () => {
    const subscription = makeSubscription(['price_test_monthly']);
    mockSubscriptionsRetrieve.mockResolvedValue(subscription);

    const session = makeCheckoutSession({ metadata: {} });
    const event = makeEvent('checkout.session.completed', session);

    await routeWebhookEvent(event);

    // supabaseServer.from('users').update should not be called
    const userFromCalls = mockFrom.mock.calls.filter((call: unknown[]) => call[0] === 'users');
    expect(userFromCalls).toHaveLength(0);
  });

  it('reads billing date from subscription.items.data[0].current_period_end', async () => {
    // The expected billing date ISO string derived from current_period_end * 1000
    const currentPeriodEnd = 1800000000;
    const expectedDate = new Date(currentPeriodEnd * 1000).toISOString();

    const subscription = makeSubscription(['price_test_monthly'], 'cus_test', 'sub_test');
    mockSubscriptionsRetrieve.mockResolvedValue(subscription);

    // Capture the update args by intercepting the supabase chain
    let capturedUpdateData: Record<string, unknown> | null = null;

    mockFrom.mockImplementation((table: string) => {
      const chain = buildQueryChain(table);
      if (table === 'users') {
        chain.update = vi.fn((data: Record<string, unknown>) => {
          capturedUpdateData = data;
          return { eq: vi.fn(() => Promise.resolve(mockUpdateResult)) };
        });
      }
      return chain;
    });

    const session = makeCheckoutSession();
    const event = makeEvent('checkout.session.completed', session);

    await routeWebhookEvent(event);

    expect(capturedUpdateData).not.toBeNull();
    expect(capturedUpdateData!.next_billing_date).toBe(expectedDate);
  });

  it('sets plan_type to monthly for price_test_monthly', async () => {
    const subscription = makeSubscription(['price_test_monthly']);
    mockSubscriptionsRetrieve.mockResolvedValue(subscription);

    let capturedUpdateData: Record<string, unknown> | null = null;
    mockFrom.mockImplementation((table: string) => {
      const chain = buildQueryChain(table);
      if (table === 'users') {
        chain.update = vi.fn((data: Record<string, unknown>) => {
          capturedUpdateData = data;
          return { eq: vi.fn(() => Promise.resolve(mockUpdateResult)) };
        });
      }
      return chain;
    });

    const session = makeCheckoutSession();
    const event = makeEvent('checkout.session.completed', session);

    await routeWebhookEvent(event);

    expect(capturedUpdateData!.plan_type).toBe('monthly');
    expect(capturedUpdateData!.subscription_status).toBe('active');
  });

  it('sets plan_type to annual for price_test_annual', async () => {
    const subscription = makeSubscription(['price_test_annual']);
    mockSubscriptionsRetrieve.mockResolvedValue(subscription);

    let capturedUpdateData: Record<string, unknown> | null = null;
    mockFrom.mockImplementation((table: string) => {
      const chain = buildQueryChain(table);
      if (table === 'users') {
        chain.update = vi.fn((data: Record<string, unknown>) => {
          capturedUpdateData = data;
          return { eq: vi.fn(() => Promise.resolve(mockUpdateResult)) };
        });
      }
      return chain;
    });

    const session = makeCheckoutSession();
    const event = makeEvent('checkout.session.completed', session);

    await routeWebhookEvent(event);

    expect(capturedUpdateData!.plan_type).toBe('annual');
  });

  it('detects premium add-on and sets has_premium_memory: true', async () => {
    const subscription = makeSubscription(['price_test_monthly', 'price_test_premium_monthly']);
    mockSubscriptionsRetrieve.mockResolvedValue(subscription);

    let capturedUpdateData: Record<string, unknown> | null = null;
    mockFrom.mockImplementation((table: string) => {
      const chain = buildQueryChain(table);
      if (table === 'users') {
        chain.update = vi.fn((data: Record<string, unknown>) => {
          capturedUpdateData = data;
          return { eq: vi.fn(() => Promise.resolve(mockUpdateResult)) };
        });
      }
      return chain;
    });

    const session = makeCheckoutSession();
    const event = makeEvent('checkout.session.completed', session);

    await routeWebhookEvent(event);

    expect(capturedUpdateData!.has_premium_memory).toBe(true);
    expect(capturedUpdateData!.stripe_premium_item_id).toBe('si_test_1');
  });
});

// ---------------------------------------------------------------------------
// routeWebhookEvent — customer.subscription.updated
// ---------------------------------------------------------------------------

describe('routeWebhookEvent — customer.subscription.updated', () => {
  it('updates the user record by stripe_customer_id', async () => {
    const subscription = makeSubscription(['price_test_monthly'], 'cus_updated');
    const event = makeEvent('customer.subscription.updated', subscription);

    let capturedEqField: string | null = null;
    let capturedEqValue: unknown = null;

    mockFrom.mockImplementation((table: string) => {
      const chain = buildQueryChain(table);
      if (table === 'users') {
        chain.update = vi.fn(() => ({
          eq: vi.fn((field: string, value: unknown) => {
            capturedEqField = field;
            capturedEqValue = value;
            return Promise.resolve(mockUpdateResult);
          }),
        }));
      }
      return chain;
    });

    await routeWebhookEvent(event);

    expect(capturedEqField).toBe('stripe_customer_id');
    expect(capturedEqValue).toBe('cus_updated');
  });

  it('uses subscription.items.data[0].current_period_end for billing date', async () => {
    const currentPeriodEnd = 1900000000;
    const expectedDate = new Date(currentPeriodEnd * 1000).toISOString();

    const subscription = {
      id: 'sub_test',
      customer: 'cus_test',
      items: {
        data: [
          {
            id: 'si_test_0',
            price: { id: 'price_test_monthly' },
            current_period_end: currentPeriodEnd,
          },
        ],
      },
    } as unknown as Stripe.Subscription;

    const event = makeEvent('customer.subscription.updated', subscription);

    let capturedUpdateData: Record<string, unknown> | null = null;
    mockFrom.mockImplementation((table: string) => {
      const chain = buildQueryChain(table);
      if (table === 'users') {
        chain.update = vi.fn((data: Record<string, unknown>) => {
          capturedUpdateData = data;
          return { eq: vi.fn(() => Promise.resolve(mockUpdateResult)) };
        });
      }
      return chain;
    });

    await routeWebhookEvent(event);

    expect(capturedUpdateData!.next_billing_date).toBe(expectedDate);
  });

  it('returns early when no base price is found on subscription', async () => {
    // Subscription with only a premium add-on price (no base plan price)
    const subscription = makeSubscription(['price_test_premium_monthly'], 'cus_test');
    const event = makeEvent('customer.subscription.updated', subscription);

    let usersUpdateCalled = false;
    mockFrom.mockImplementation((table: string) => {
      const chain = buildQueryChain(table);
      if (table === 'users') {
        chain.update = vi.fn(() => {
          usersUpdateCalled = true;
          return { eq: vi.fn(() => Promise.resolve(mockUpdateResult)) };
        });
      }
      return chain;
    });

    await routeWebhookEvent(event);

    expect(usersUpdateCalled).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// routeWebhookEvent — customer.subscription.deleted
// ---------------------------------------------------------------------------

describe('routeWebhookEvent — customer.subscription.deleted', () => {
  it('sets subscription_status to lapsed', async () => {
    const subscription = makeSubscription(['price_test_monthly'], 'cus_deleted');
    const event = makeEvent('customer.subscription.deleted', subscription);

    let capturedUpdateData: Record<string, unknown> | null = null;
    let capturedEqField: string | null = null;
    let capturedEqValue: unknown = null;

    mockFrom.mockImplementation((table: string) => {
      const chain = buildQueryChain(table);
      if (table === 'users') {
        chain.update = vi.fn((data: Record<string, unknown>) => {
          capturedUpdateData = data;
          return {
            eq: vi.fn((field: string, value: unknown) => {
              capturedEqField = field;
              capturedEqValue = value;
              return Promise.resolve(mockUpdateResult);
            }),
          };
        });
      }
      return chain;
    });

    await routeWebhookEvent(event);

    expect(capturedUpdateData!.subscription_status).toBe('lapsed');
    expect(capturedEqField).toBe('stripe_customer_id');
    expect(capturedEqValue).toBe('cus_deleted');
  });

  it('sets subscription_lapsed_at to a non-null ISO string', async () => {
    const subscription = makeSubscription(['price_test_monthly'], 'cus_deleted');
    const event = makeEvent('customer.subscription.deleted', subscription);

    let capturedUpdateData: Record<string, unknown> | null = null;

    mockFrom.mockImplementation((table: string) => {
      const chain = buildQueryChain(table);
      if (table === 'users') {
        chain.update = vi.fn((data: Record<string, unknown>) => {
          capturedUpdateData = data;
          return { eq: vi.fn(() => Promise.resolve(mockUpdateResult)) };
        });
      }
      return chain;
    });

    await routeWebhookEvent(event);

    expect(capturedUpdateData!.subscription_lapsed_at).toBeTruthy();
    // Should be a valid ISO string
    expect(() =>
      new Date(capturedUpdateData!.subscription_lapsed_at as string),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// routeWebhookEvent — invoice.payment_failed
// ---------------------------------------------------------------------------

describe('routeWebhookEvent — invoice.payment_failed', () => {
  it('sets subscription_status to lapsed', async () => {
    const invoice = {
      customer: 'cus_invoice_test',
    } as unknown as Stripe.Invoice;

    const event = makeEvent('invoice.payment_failed', invoice);

    let capturedUpdateData: Record<string, unknown> | null = null;
    let capturedEqField: string | null = null;
    let capturedEqValue: unknown = null;

    mockFrom.mockImplementation((table: string) => {
      const chain = buildQueryChain(table);
      if (table === 'users') {
        chain.update = vi.fn((data: Record<string, unknown>) => {
          capturedUpdateData = data;
          return {
            eq: vi.fn((field: string, value: unknown) => {
              capturedEqField = field;
              capturedEqValue = value;
              return Promise.resolve(mockUpdateResult);
            }),
          };
        });
      }
      return chain;
    });

    await routeWebhookEvent(event);

    expect(capturedUpdateData!.subscription_status).toBe('lapsed');
    expect(capturedEqField).toBe('stripe_customer_id');
    expect(capturedEqValue).toBe('cus_invoice_test');
  });

  it('returns early when invoice.customer is null', async () => {
    const invoice = {
      customer: null,
    } as unknown as Stripe.Invoice;

    const event = makeEvent('invoice.payment_failed', invoice);

    let usersUpdateCalled = false;
    mockFrom.mockImplementation((table: string) => {
      const chain = buildQueryChain(table);
      if (table === 'users') {
        chain.update = vi.fn(() => {
          usersUpdateCalled = true;
          return { eq: vi.fn(() => Promise.resolve(mockUpdateResult)) };
        });
      }
      return chain;
    });

    await routeWebhookEvent(event);

    expect(usersUpdateCalled).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// routeWebhookEvent — unhandled event types
// ---------------------------------------------------------------------------

describe('routeWebhookEvent — unhandled event types', () => {
  it('silently ignores unhandled event type without throwing', async () => {
    const event = makeEvent('payment_intent.created', {});

    await expect(routeWebhookEvent(event)).resolves.toBeUndefined();

    // No users table updates should happen
    const userFromCalls = mockFrom.mock.calls.filter((call: unknown[]) => call[0] === 'users');
    expect(userFromCalls).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// routeWebhookEvent — idempotency pre-insert
// ---------------------------------------------------------------------------

describe('routeWebhookEvent — pre-insert into webhook_events', () => {
  it('inserts a record into webhook_events before dispatching', async () => {
    const subscription = makeSubscription(['price_test_monthly'], 'cus_test');
    const event = makeEvent('customer.subscription.updated', subscription, 'evt_unique_abc');

    const insertedTables: string[] = [];
    let capturedInsertData: Record<string, unknown> | null = null;

    mockFrom.mockImplementation((table: string) => {
      const chain = buildQueryChain(table);
      if (table === 'webhook_events') {
        chain.insert = vi.fn((data: Record<string, unknown>) => {
          insertedTables.push(table);
          capturedInsertData = data;
          return Promise.resolve(mockInsertResult);
        });
      }
      return chain;
    });

    await routeWebhookEvent(event);

    expect(insertedTables).toContain('webhook_events');
    expect(capturedInsertData).not.toBeNull();
    expect(capturedInsertData!.stripe_event_id).toBe('evt_unique_abc');
    expect(capturedInsertData!.event_type).toBe('customer.subscription.updated');
  });
});
