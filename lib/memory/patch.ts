import 'server-only';

import { getMessagesByChatId } from '../db/messages';
import { getMemoryProfileByUserId, updateMemoryProfile } from '../db/memory';
import { callCompression } from '../openai/client';
import type { Message } from '../db/messages';

// ---------------------------------------------------------------------------
// patchMemoryProfile
// ---------------------------------------------------------------------------

/**
 * Updates an existing psychological memory profile for a user by analysing
 * the 10 most recent user+assistant message pairs from the specified chat that
 * have not been included in previous compression cycles.
 *
 * Steps:
 *  1. Fetch the existing memory profile for the user.
 *  2. Fetch all messages for the chat ordered by creation date ascending.
 *  3. Extract the 10 most recent user+assistant pairs (up to 20 individual
 *     messages) that post-date the profile's last_updated_at timestamp,
 *     treating them as new context.
 *  4. Build a patch prompt containing the existing profile JSON and the new
 *     message pairs.
 *  5. Call callCompression() to obtain the updated profile object.
 *  6. Persist the result via updateMemoryProfile() which also increments the
 *     version counter and sets last_updated_at = now().
 *
 * This function NEVER throws to its calling context — all errors are caught
 * and logged server-side only, per the memory compression failure policy.
 *
 * @param chatId  UUID of the chat providing new message pairs.
 * @param userId  UUID of the owning user.
 * @param model   OpenAI model identifier ('gpt-4o-mini' or 'gpt-4o').
 */
export async function patchMemoryProfile(
  chatId: string,
  userId: string,
  model: string,
): Promise<void> {
  const now = new Date().toISOString();

  // -------------------------------------------------------------------------
  // Step 1 — Fetch the existing memory profile
  // -------------------------------------------------------------------------
  let existingProfileRow: Awaited<ReturnType<typeof getMemoryProfileByUserId>>;
  try {
    existingProfileRow = await getMemoryProfileByUserId(userId);
  } catch (err) {
    console.error('[patchMemoryProfile] Failed to fetch existing memory profile:', err);
    return;
  }

  if (existingProfileRow === null) {
    console.error(
      '[patchMemoryProfile] No existing memory profile found for userId:',
      userId,
      '— cannot patch without a base profile. Run generateInitialProfile first.',
    );
    return;
  }

  const existingProfileJson = existingProfileRow.profile_json;
  const profileLastUpdatedAt = existingProfileRow.last_updated_at;

  // -------------------------------------------------------------------------
  // Step 2 — Fetch all messages for the chat in chronological order
  // -------------------------------------------------------------------------
  let allMessages: Message[];
  try {
    allMessages = await getMessagesByChatId(chatId);
  } catch (err) {
    console.error('[patchMemoryProfile] Failed to fetch messages for chatId:', chatId, err);
    return;
  }

  if (allMessages.length === 0) {
    console.error('[patchMemoryProfile] No messages found for chatId:', chatId);
    return;
  }

  // -------------------------------------------------------------------------
  // Step 3 — Identify new message pairs since last profile update
  //
  // Strategy:
  //   - Filter to messages created after profileLastUpdatedAt to isolate
  //     messages not yet included in any compression cycle.
  //   - Group into consecutive user+assistant pairs (a pair is a user message
  //     followed immediately by an assistant message).
  //   - Take the 10 most recent complete pairs (up to 20 messages).
  //   - If fewer than 10 complete pairs are available, use whatever is present.
  // -------------------------------------------------------------------------
  const newMessages = allMessages.filter(
    (msg) => msg.created_at > profileLastUpdatedAt,
  );

  // Build complete user+assistant pairs from the filtered messages.
  // Iterate through the new messages in order, pairing each user message with
  // the immediately following assistant message.
  const pairs: [Message, Message][] = [];
  let i = 0;
  while (i < newMessages.length - 1) {
    const current = newMessages[i];
    const next = newMessages[i + 1];
    if (current.role === 'user' && next.role === 'assistant') {
      pairs.push([current, next]);
      i += 2;
    } else {
      i += 1;
    }
  }

  // Take the 10 most recent complete pairs.
  const recentPairs = pairs.slice(-10);

  if (recentPairs.length === 0) {
    console.error(
      '[patchMemoryProfile] No new user+assistant message pairs found after last profile update for chatId:',
      chatId,
    );
    return;
  }

  // Flatten pairs back into a sequential list of messages.
  const pairMessages: Message[] = recentPairs.flat();

  // -------------------------------------------------------------------------
  // Step 4 — Format new message pairs for the patch prompt
  // -------------------------------------------------------------------------
  const formattedNewMessages = pairMessages
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Rise'}: ${msg.content}`)
    .join('\n');

  const existingProfileJsonString = JSON.stringify(existingProfileJson, null, 2);

  const patchPromptText = `You are updating an existing psychological profile of a user based on ${recentPairs.length} new message pair${recentPairs.length === 1 ? '' : 's'} from their conversation with Rise.

Existing profile:
${existingProfileJsonString}

New messages:
${formattedNewMessages}

Update the profile additively and revisionally:
- Add new insights, patterns, and themes you observe
- Refine or expand existing entries based on new evidence
- Early context is compressed into patterns — do not delete insights
- Update "lastUpdatedAt" to the current timestamp: ${now}

Output ONLY the complete updated JSON profile matching the original schema exactly.`;

  const compressionMessages = [
    {
      role: 'user' as const,
      content: patchPromptText,
    },
  ];

  // -------------------------------------------------------------------------
  // Step 5 — Call the compression model with retry
  // -------------------------------------------------------------------------
  const delays = [1000, 2000, 4000];
  let updatedProfileJson: object | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      updatedProfileJson = await callCompression(compressionMessages, model);
      break;
    } catch (err) {
      if (attempt < 2) {
        await new Promise<void>((resolve) => setTimeout(resolve, delays[attempt]));
      } else {
        console.error('[patchMemoryProfile] Memory patch compression failed after 3 retries:', err);
        return;
      }
    }
  }

  if (updatedProfileJson === null) {
    console.error('[patchMemoryProfile] updatedProfileJson is null after compression attempts.');
    return;
  }

  // -------------------------------------------------------------------------
  // Step 6 — Persist the updated profile
  // -------------------------------------------------------------------------
  try {
    await updateMemoryProfile(userId, updatedProfileJson, model);
  } catch (err) {
    console.error('[patchMemoryProfile] Failed to store updated memory profile:', err);
  }
}
