/**
 * Integration tests for app/api/chat/[chatId]/message/route.ts
 *
 * All external dependencies are mocked. No real database, OpenAI, or Stripe calls.
 *
 * vi.mock() is hoisted to the top of the file by vitest, so mock classes and
 * vi.fn() handles are declared with vi.hoisted() to ensure they are available
 * when the factory functions run.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Hoisted mock handles — must be declared before vi.mock() factories run
// ---------------------------------------------------------------------------

const {
  MockNextResponse,
  MockNextRequest,
  mockGetUserFromRequest,
  mockGetUserById,
  mockCreateMessage,
  mockGetMessagesByChatId,
  mockGetMemoryProfileByUserId,
  mockBuildSystemMessage,
  mockBuildMessageWindow,
  mockBuildApiMessages,
  mockCheckRateLimit,
  mockRecordMessage,
  mockCallRise,
  mockExecuteCompressionAsync,
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
    cookies: { get: (name: string) => { value: string } | undefined };
    private _jsonFn: () => unknown;
    headers: { get: (name: string) => string | null };

    constructor(opts: {
      cookieValue?: string | null;
      jsonFn?: () => unknown;
    } = {}) {
      const cv = opts.cookieValue;
      this.cookies = {
        get: (name: string) => {
          if (name === 'risedial_session') {
            return cv ? { value: cv } : undefined;
          }
          return undefined;
        },
      };
      this._jsonFn = opts.jsonFn ?? (() => ({ content: 'Hello Rise' }));
      this.headers = { get: () => null };
    }

    async json(): Promise<unknown> {
      return this._jsonFn();
    }
  }

  return {
    MockNextResponse: HoistedNextResponse,
    MockNextRequest: HoistedNextRequest,
    mockGetUserFromRequest: vi.fn(),
    mockGetUserById: vi.fn(),
    mockCreateMessage: vi.fn(),
    mockGetMessagesByChatId: vi.fn(),
    mockGetMemoryProfileByUserId: vi.fn(),
    mockBuildSystemMessage: vi.fn(),
    mockBuildMessageWindow: vi.fn(),
    mockBuildApiMessages: vi.fn(),
    mockCheckRateLimit: vi.fn(),
    mockRecordMessage: vi.fn(),
    mockCallRise: vi.fn(),
    mockExecuteCompressionAsync: vi.fn(),
  };
});

// ---------------------------------------------------------------------------
// Module mocks — factories reference hoisted values
// ---------------------------------------------------------------------------

vi.mock('next/server', () => ({
  NextResponse: MockNextResponse,
  NextRequest: MockNextRequest,
}));

vi.mock('@/lib/auth/getUser', () => ({
  getUserFromRequest: (...args: unknown[]) => mockGetUserFromRequest(...args),
}));

vi.mock('@/lib/db/users', () => ({
  getUserById: (...args: unknown[]) => mockGetUserById(...args),
}));

vi.mock('@/lib/db/messages', () => ({
  createMessage: (...args: unknown[]) => mockCreateMessage(...args),
  getMessagesByChatId: (...args: unknown[]) => mockGetMessagesByChatId(...args),
}));

vi.mock('@/lib/db/memory', () => ({
  getMemoryProfileByUserId: (...args: unknown[]) => mockGetMemoryProfileByUserId(...args),
}));

vi.mock('@/lib/rise/system-prompt', () => ({
  buildSystemMessage: (...args: unknown[]) => mockBuildSystemMessage(...args),
}));

vi.mock('@/lib/rise/context-window', () => ({
  buildMessageWindow: (...args: unknown[]) => mockBuildMessageWindow(...args),
}));

vi.mock('@/lib/rise/api-messages', () => ({
  buildApiMessages: (...args: unknown[]) => mockBuildApiMessages(...args),
}));

vi.mock('@/lib/rise/rate-limit', () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  recordMessage: (...args: unknown[]) => mockRecordMessage(...args),
}));

vi.mock('@/lib/openai/client', () => ({
  callRise: (...args: unknown[]) => mockCallRise(...args),
}));

vi.mock('@/lib/memory/executor', () => ({
  executeCompressionAsync: (...args: unknown[]) => mockExecuteCompressionAsync(...args),
}));

// ---------------------------------------------------------------------------
// Import module under test AFTER all mocks
// ---------------------------------------------------------------------------

import { POST } from '@/app/api/chat/[chatId]/message/route';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CHAT_ID = 'chat-uuid-1234';
const USER_ID = 'user-uuid-5678';

const MOCK_USER = {
  id: USER_ID,
  email: 'test@example.com',
  password_hash: 'hashed',
  preferred_name: 'Alex',
  subscription_status: 'active' as const,
  stripe_customer_id: null,
  stripe_subscription_id: null,
  stripe_premium_item_id: null,
  plan_type: 'monthly' as const,
  has_premium_memory: false,
  next_billing_date: null,
  subscription_lapsed_at: null,
  created_at: '2026-01-01T00:00:00.000Z',
};

const MOCK_ASSISTANT_MESSAGE = {
  id: 'msg-uuid-999',
  chat_id: CHAT_ID,
  role: 'assistant' as const,
  content: 'Hello, I am Rise.',
  created_at: '2026-01-01T00:01:00.000Z',
  user_message_index: null,
};

type RequestOpts = {
  cookieValue?: string | null;
  jsonFn?: () => unknown;
};

function makeRequest(opts: RequestOpts = {}): InstanceType<typeof MockNextRequest> {
  return new MockNextRequest({
    cookieValue: opts.cookieValue !== undefined ? opts.cookieValue : 'valid-jwt-token',
    jsonFn: opts.jsonFn,
  });
}

function makeParams(chatId: string = CHAT_ID) {
  return { params: { chatId } };
}

// ---------------------------------------------------------------------------
// Reset mocks before each test
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.resetAllMocks();

  // Default happy-path returns
  mockGetUserFromRequest.mockResolvedValue({
    user_id: USER_ID,
    subscription_status: 'active',
  });
  mockGetUserById.mockResolvedValue(MOCK_USER);
  mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 59 });
  mockGetMessagesByChatId.mockResolvedValue([]);
  mockCreateMessage
    .mockResolvedValueOnce({
      id: 'msg-uuid-user',
      chat_id: CHAT_ID,
      role: 'user',
      content: 'Hello Rise',
      created_at: '2026-01-01T00:00:00.000Z',
      user_message_index: 0,
    })
    .mockResolvedValueOnce(MOCK_ASSISTANT_MESSAGE);
  mockGetMemoryProfileByUserId.mockResolvedValue(null);
  mockBuildSystemMessage.mockReturnValue('You are Rise...');
  mockBuildMessageWindow.mockReturnValue([]);
  mockBuildApiMessages.mockReturnValue([{ role: 'system', content: 'You are Rise...' }]);
  mockCallRise.mockResolvedValue('Hello, I am Rise.');
  mockRecordMessage.mockResolvedValue(undefined);
  mockExecuteCompressionAsync.mockResolvedValue(undefined);
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/chat/[chatId]/message', () => {
  // ── Auth gate ──────────────────────────────────────────────────────────────

  it('returns 401 when session is null (user not authenticated)', async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const req = makeRequest() as unknown as import('next/server').NextRequest;
    const res = (await POST(req, makeParams() as any)) as unknown as InstanceType<typeof MockNextResponse>;

    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('Authentication required.');
  });

  // ── Subscription gate ──────────────────────────────────────────────────────

  it('returns 403 when subscription_status is not active', async () => {
    mockGetUserFromRequest.mockResolvedValue({
      user_id: USER_ID,
      subscription_status: 'lapsed',
    });

    const req = makeRequest() as unknown as import('next/server').NextRequest;
    const res = (await POST(req, makeParams() as any)) as unknown as InstanceType<typeof MockNextResponse>;

    expect(res.status).toBe(403);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.code).toBe('SUBSCRIPTION_INACTIVE');
  });

  // ── User not found ─────────────────────────────────────────────────────────

  it('returns 404 when user record is not found', async () => {
    mockGetUserById.mockResolvedValue(null);

    const req = makeRequest() as unknown as import('next/server').NextRequest;
    const res = (await POST(req, makeParams() as any)) as unknown as InstanceType<typeof MockNextResponse>;

    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('User not found.');
  });

  // ── Rate limit ─────────────────────────────────────────────────────────────

  it('returns 429 when checkRateLimit returns allowed: false', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false, remaining: 0 });

    const req = makeRequest() as unknown as import('next/server').NextRequest;
    const res = (await POST(req, makeParams() as any)) as unknown as InstanceType<typeof MockNextResponse>;

    expect(res.status).toBe(429);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain('Rise needs a moment');
  });

  // ── Invalid JSON body ──────────────────────────────────────────────────────

  it('returns 400 when request body is not valid JSON', async () => {
    const req = makeRequest({
      jsonFn: () => {
        throw new SyntaxError('Unexpected token');
      },
    }) as unknown as import('next/server').NextRequest;

    const res = (await POST(req, makeParams() as any)) as unknown as InstanceType<typeof MockNextResponse>;

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('Invalid request body.');
  });

  // ── Empty content ──────────────────────────────────────────────────────────

  it('returns 400 when content is empty string', async () => {
    const req = makeRequest({
      jsonFn: () => ({ content: '' }),
    }) as unknown as import('next/server').NextRequest;

    const res = (await POST(req, makeParams() as any)) as unknown as InstanceType<typeof MockNextResponse>;

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('Message content is required.');
  });

  it('returns 400 when content is whitespace-only string', async () => {
    const req = makeRequest({
      jsonFn: () => ({ content: '   ' }),
    }) as unknown as import('next/server').NextRequest;

    const res = (await POST(req, makeParams() as any)) as unknown as InstanceType<typeof MockNextResponse>;

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('Message content is required.');
  });

  // ── Happy path ─────────────────────────────────────────────────────────────

  it('returns 200 with truncation_warning: false on happy path', async () => {
    const req = makeRequest({
      jsonFn: () => ({ content: 'Hello Rise' }),
    }) as unknown as import('next/server').NextRequest;

    const res = (await POST(req, makeParams() as any)) as unknown as InstanceType<typeof MockNextResponse>;

    expect(res.status).toBe(200);
    const body = (await res.json()) as { message: unknown; truncation_warning: boolean };
    expect(body.truncation_warning).toBe(false);
    expect(body.message).toEqual(MOCK_ASSISTANT_MESSAGE);
  });

  // ── Truncation ─────────────────────────────────────────────────────────────

  it('sets truncation_warning: true when content exceeds 4000 characters', async () => {
    const longContent = 'x'.repeat(4001);

    const req = makeRequest({
      jsonFn: () => ({ content: longContent }),
    }) as unknown as import('next/server').NextRequest;

    const res = (await POST(req, makeParams() as any)) as unknown as InstanceType<typeof MockNextResponse>;

    expect(res.status).toBe(200);
    const body = (await res.json()) as { truncation_warning: boolean };
    expect(body.truncation_warning).toBe(true);
  });

  it('does not set truncation_warning when content is exactly 4000 characters', async () => {
    const exactContent = 'y'.repeat(4000);

    const req = makeRequest({
      jsonFn: () => ({ content: exactContent }),
    }) as unknown as import('next/server').NextRequest;

    const res = (await POST(req, makeParams() as any)) as unknown as InstanceType<typeof MockNextResponse>;

    expect(res.status).toBe(200);
    const body = (await res.json()) as { truncation_warning: boolean };
    expect(body.truncation_warning).toBe(false);
  });

  // ── recordMessage is called after success ──────────────────────────────────

  it('calls recordMessage after a successful response', async () => {
    const req = makeRequest() as unknown as import('next/server').NextRequest;

    await POST(req, makeParams() as any);

    expect(mockRecordMessage).toHaveBeenCalledTimes(1);
    expect(mockRecordMessage).toHaveBeenCalledWith(USER_ID);
  });

  // ── executeCompressionAsync is fired (void, non-blocking) ─────────────────

  it('fires executeCompressionAsync on success', async () => {
    const req = makeRequest() as unknown as import('next/server').NextRequest;

    await POST(req, makeParams() as any);

    expect(mockExecuteCompressionAsync).toHaveBeenCalledTimes(1);
    expect(mockExecuteCompressionAsync).toHaveBeenCalledWith(
      CHAT_ID,
      USER_ID,
      MOCK_USER.has_premium_memory,
    );
  });

  // ── createMessage is called for user message ───────────────────────────────

  it('persists user message via createMessage', async () => {
    const req = makeRequest({
      jsonFn: () => ({ content: 'Hello Rise' }),
    }) as unknown as import('next/server').NextRequest;

    await POST(req, makeParams() as any);

    expect(mockCreateMessage).toHaveBeenCalledWith(CHAT_ID, 'user', 'Hello Rise', 0);
  });

  // ── callRise is called with messages ──────────────────────────────────────

  it('calls callRise with the built API messages', async () => {
    const fakeMessages = [{ role: 'system', content: 'You are Rise...' }];
    mockBuildApiMessages.mockReturnValue(fakeMessages);

    const req = makeRequest() as unknown as import('next/server').NextRequest;

    await POST(req, makeParams() as any);

    expect(mockCallRise).toHaveBeenCalledWith(fakeMessages);
  });
});
