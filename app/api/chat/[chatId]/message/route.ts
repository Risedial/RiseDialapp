import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { getUserFromRequest } from '@/lib/auth/getUser';
import { getUserById } from '@/lib/db/users';
import { createMessage, getMessagesByChatId } from '@/lib/db/messages';
import { getMemoryProfileByUserId } from '@/lib/db/memory';
import { buildSystemMessage } from '@/lib/rise/system-prompt';
import { buildMessageWindow } from '@/lib/rise/context-window';
import { buildApiMessages } from '@/lib/rise/api-messages';
import { checkRateLimit, recordMessage } from '@/lib/rise/rate-limit';
import { callRise } from '@/lib/openai/client';
import { executeCompressionAsync } from '@/lib/memory/executor';

const MAX_CONTENT_LENGTH = 4000;

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
): Promise<NextResponse> {
  const { chatId } = params;

  // Auth gate — verify JWT session cookie
  const session = await getUserFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401 }
    );
  }

  const { user_id: userId, subscription_status: subscriptionStatus } = session;

  // Subscription gate — must be active
  if (subscriptionStatus !== 'active') {
    return NextResponse.json(
      {
        error: 'Subscription required.',
        code: 'SUBSCRIPTION_INACTIVE',
      },
      { status: 403 }
    );
  }

  // Fetch full user record to get plan details
  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json(
      { error: 'User not found.' },
      { status: 404 }
    );
  }

  const hasPremium = user.has_premium_memory;

  // Rate limit check
  const { allowed: rateLimitAllowed } = await checkRateLimit(userId);
  if (!rateLimitAllowed) {
    return NextResponse.json(
      { error: 'Rise needs a moment. Try again in a few seconds.' },
      { status: 429 }
    );
  }

  // Parse request body
  let rawContent: string;
  try {
    const body = await request.json();
    rawContent = typeof body?.content === 'string' ? body.content : '';
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  if (!rawContent.trim()) {
    return NextResponse.json(
      { error: 'Message content is required.' },
      { status: 400 }
    );
  }

  // Truncate to 4000 characters if needed
  let truncation_warning = false;
  let content = rawContent;
  if (content.length > MAX_CONTENT_LENGTH) {
    content = content.slice(0, MAX_CONTENT_LENGTH);
    truncation_warning = true;
  }

  // Determine user_message_index for this chat
  const existingMessages = await getMessagesByChatId(chatId);
  const userMessageCount = existingMessages.filter((m) => m.role === 'user').length;
  const userMessageIndex = userMessageCount;

  // Persist the user message
  await createMessage(chatId, 'user', content, userMessageIndex);

  // Fetch memory profile for the user
  const memoryProfile = await getMemoryProfileByUserId(userId);
  const profileJson = memoryProfile ? memoryProfile.profile_json : null;

  // Build the system prompt (includes preferred name if available)
  const systemPrompt = buildSystemMessage(user.preferred_name);

  // Build the rolling context window from prior messages (excluding the just-inserted message)
  const windowMessages = buildMessageWindow(
    existingMessages.map((m) => ({ role: m.role, content: m.content }))
  );

  // Append the current user message to the window for the API call
  windowMessages.push({ role: 'user', content });

  // Build the full API message array
  const apiMessages = buildApiMessages(systemPrompt, profileJson, windowMessages);

  // Call OpenAI non-streaming with 30-second timeout
  const assistantContent = await callRise(apiMessages);

  // Persist the assistant response
  const assistantMessage = await createMessage(chatId, 'assistant', assistantContent);

  // Trigger async compression check — keep function alive until complete
  waitUntil(executeCompressionAsync(chatId, userId, hasPremium));

  // Record this message in rate limit tracking
  await recordMessage(userId);

  return NextResponse.json({
    message: assistantMessage,
    truncation_warning,
  });
}
