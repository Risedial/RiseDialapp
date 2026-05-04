export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Approximates the token count for a message array.
 * Uses the 4 characters = 1 token approximation.
 */
function approximateTokens(messages: Message[]): number {
  return messages.reduce((total, msg) => total + Math.ceil(msg.content.length / 4), 0);
}

/**
 * Builds a rolling context window from a message history.
 *
 * Rules:
 * - Keeps at most `maxPairs` user/assistant pairs (default: 40)
 * - Keeps at most `maxTokens` total tokens (default: 12,000)
 * - Starts from the most recent messages and works backwards
 * - Drops oldest pairs first when either limit is exceeded
 * - Returns messages in chronological order (oldest first)
 *
 * @param messages  Full message history (alternating user / assistant)
 * @param maxPairs  Maximum number of user+assistant pairs to include
 * @param maxTokens Maximum total token budget (4 chars = 1 token approximation)
 */
export function buildMessageWindow(
  messages: Message[],
  maxPairs: number = 40,
  maxTokens: number = 12000,
): Message[] {
  // Walk from the end of the array, collecting complete pairs.
  // A "pair" is one user message followed by one assistant message.
  // We iterate from the back and collect pairs until a limit is hit.

  const collected: Message[] = [];
  let tokenCount = 0;
  let pairCount = 0;

  // Iterate backwards through the message list, consuming two messages at a
  // time (assistant then user, since we walk from the end).
  let i = messages.length - 1;

  while (i >= 1 && pairCount < maxPairs) {
    const assistant = messages[i];
    const user = messages[i - 1];

    // Require a proper user/assistant pair.
    if (user.role !== 'user' || assistant.role !== 'assistant') {
      // Not a clean pair — stop here to avoid including partial context.
      break;
    }

    const pairTokens =
      Math.ceil(user.content.length / 4) + Math.ceil(assistant.content.length / 4);

    if (tokenCount + pairTokens > maxTokens) {
      // Adding this pair would exceed the token budget — stop.
      break;
    }

    tokenCount += pairTokens;
    pairCount += 1;

    // Prepend the pair so they stay in chronological order as we collect.
    collected.unshift(assistant);
    collected.unshift(user);

    i -= 2;
  }

  return collected;
}
