import { Message } from './context-window';

export interface ApiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Constructs the OpenAI API message array for a Rise conversation.
 *
 * Message order:
 * 1. System prompt — always present as the first message.
 * 2. Memory profile injection — present ONLY when memoryProfile is non-null.
 *    Omitted entirely (no null entry) when memoryProfile is null.
 * 3. Conversation window — each message is a separate object in the array.
 *
 * @param systemPrompt      The Rise system prompt string.
 * @param memoryProfile     The user memory profile object, or null if unavailable.
 * @param conversationWindow  The rolling context window of alternating user/assistant messages.
 * @returns                 An ordered array of API message objects.
 */
export function buildApiMessages(
  systemPrompt: string,
  memoryProfile: object | null,
  conversationWindow: Message[],
): ApiMessage[] {
  const messages: ApiMessage[] = [];

  // 1. System prompt — always first.
  messages.push({ role: 'system', content: systemPrompt });

  // 2. Memory profile — included only when memoryProfile is non-null.
  if (memoryProfile !== null) {
    messages.push({
      role: 'system',
      content: 'User context profile: ' + JSON.stringify(memoryProfile),
    });
  }

  // 3. Conversation window — each message is a separate object.
  for (const msg of conversationWindow) {
    messages.push({ role: msg.role, content: msg.content });
  }

  return messages;
}
