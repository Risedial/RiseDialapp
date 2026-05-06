import 'server-only';

import { getMessagesByUserId } from '../db/messages';
import { createMemoryProfile } from '../db/memory';
import { callCompression } from '../openai/client';
import type { Message } from '../db/messages';

// ---------------------------------------------------------------------------
// generateInitialProfile
// ---------------------------------------------------------------------------

/**
 * Generates an initial psychological memory profile for a user based on all
 * messages in a given chat session.
 *
 * Steps:
 *  1. Fetch all messages (user + assistant) from the specified chat.
 *  2. Build a compression prompt instructing the model to output structured JSON.
 *  3. Call callCompression() to obtain the parsed profile object.
 *  4. Persist the result via createMemoryProfile() in the memory_profiles table.
 *
 * This function NEVER throws to its calling context — all errors are caught
 * and logged server-side only, per the memory compression failure policy.
 *
 * @param chatId  UUID of the chat to analyse.
 * @param userId  UUID of the owning user.
 * @param model   OpenAI model identifier ('gpt-4o-mini' or 'gpt-4o').
 */
export async function generateInitialProfile(
  chatId: string,
  userId: string,
  model: string,
): Promise<void> {
  const now = new Date().toISOString();

  // -------------------------------------------------------------------------
  // Step 1 — Fetch all messages from the chat
  // -------------------------------------------------------------------------
  let messages: Message[];
  try {
    messages = await getMessagesByUserId(userId);
  } catch (err) {
    console.error('[generateInitialProfile] Failed to fetch messages:', err);
    return;
  }

  if (messages.length === 0) {
    console.error('[generateInitialProfile] No messages found for chatId:', chatId);
    return;
  }

  // -------------------------------------------------------------------------
  // Step 2 — Format messages for the compression prompt
  // -------------------------------------------------------------------------
  const formattedConversation = messages
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Rise'}: ${msg.content}`)
    .join('\n');

  const promptText = `Analyze the following conversation between a user and Rise (an AI companion) and generate a structured JSON psychological profile of the user.

The profile must capture patterns, themes, and observations across the entire conversation.

Output ONLY valid JSON matching this exact schema:
{
  "version": 1,
  "generatedAt": "${now}",
  "lastUpdatedAt": "${now}",
  "sourceChats": [{ "chat_id": "${chatId}", "deleted_at": null }],
  "profile": {
    "coreThemes": [],
    "emotionalPatterns": [],
    "worldview": [],
    "challenges": [],
    "values": [],
    "blindspots": [],
    "memorableStatements": [],
    "clinicalObservations": []
  }
}

Conversation:
${formattedConversation}`;

  const compressionMessages = [
    {
      role: 'user' as const,
      content: promptText,
    },
  ];

  // -------------------------------------------------------------------------
  // Step 3 — Call the compression model (with retry)
  // -------------------------------------------------------------------------
  const delays = [1000, 2000, 4000];
  let profileJson: object | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      profileJson = await callCompression(compressionMessages, model);
      break;
    } catch (err) {
      if (attempt < 2) {
        await new Promise<void>((resolve) => setTimeout(resolve, delays[attempt]));
      } else {
        console.error('[generateInitialProfile] Memory compression failed after 3 retries:', err);
        return;
      }
    }
  }

  if (profileJson === null) {
    console.error('[generateInitialProfile] profileJson is null after compression attempts.');
    return;
  }

  // -------------------------------------------------------------------------
  // Step 4 — Store the result in memory_profiles
  // -------------------------------------------------------------------------
  try {
    await createMemoryProfile(userId, profileJson, model);
  } catch (err) {
    console.error('[generateInitialProfile] Failed to store memory profile:', err);
  }
}
