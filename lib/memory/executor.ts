import 'server-only';

import { checkCompressionTrigger } from './trigger';
import { generateInitialProfile } from './compress';
import { patchMemoryProfile } from './patch';
import { getMemoryProfileByUserId } from '../db/memory';

// ---------------------------------------------------------------------------
// executeCompressionAsync
// ---------------------------------------------------------------------------

/**
 * Fire-and-forget async compression executor.
 *
 * Determines whether memory compression should run for the given chat/user,
 * selects the appropriate OpenAI model based on the user's premium status,
 * then dispatches either an initial profile generation or a patch update with
 * 3-attempt exponential-backoff retry logic.
 *
 * This function NEVER throws to its calling context. All errors are caught and
 * logged server-side only, per the memory compression failure policy.
 *
 * Intended call pattern:
 *   void executeCompressionAsync(chatId, userId, hasPremium)
 *
 * @param chatId     UUID of the chat that just received a new message.
 * @param userId     UUID of the owning user.
 * @param hasPremium Whether the user has the Premium Memory add-on active.
 */
export async function executeCompressionAsync(
  chatId: string,
  userId: string,
  hasPremium: boolean,
): Promise<void> {
  try {
    // -----------------------------------------------------------------------
    // Step 1 — Select compression model based on user plan
    // -----------------------------------------------------------------------
    const model = hasPremium ? 'gpt-4o' : 'gpt-4o-mini';

    // -----------------------------------------------------------------------
    // Step 2 — Check whether compression should run and what type
    // -----------------------------------------------------------------------
    let triggerResult: Awaited<ReturnType<typeof checkCompressionTrigger>>;
    try {
      triggerResult = await checkCompressionTrigger(chatId, userId);
    } catch (err) {
      console.error('[executeCompressionAsync] Failed to check compression trigger:', err);
      return;
    }

    // -----------------------------------------------------------------------
    // Step 3 — Early return if no compression is needed
    // -----------------------------------------------------------------------
    if (!triggerResult.shouldCompress) {
      return;
    }

    // -----------------------------------------------------------------------
    // Step 3b — Guard: for patch runs, verify an existing profile exists
    // -----------------------------------------------------------------------
    if (triggerResult.isPatch) {
      let existingProfile: Awaited<ReturnType<typeof getMemoryProfileByUserId>>;
      try {
        existingProfile = await getMemoryProfileByUserId(userId);
      } catch (err) {
        console.error('[executeCompressionAsync] Failed to check existing memory profile for patch guard:', err);
        return;
      }
      if (existingProfile === null) {
        // No base profile — fall back to generating the initial profile
        // instead of patching. This recovers from missed initial triggers.
        triggerResult = { shouldCompress: true, isInitial: true, isPatch: false };
      }
    }

    // -----------------------------------------------------------------------
    // Step 4 — Determine which compression function to call
    // -----------------------------------------------------------------------
    const compressionFn = triggerResult.isInitial
      ? () => generateInitialProfile(chatId, userId, model)
      : () => patchMemoryProfile(chatId, userId, model);

    // -----------------------------------------------------------------------
    // Step 5 — Execute with 3-attempt exponential-backoff retry
    //
    // Attempt 1: immediate
    // Attempt 2: after 1 000 ms
    // Attempt 3: after 2 000 ms
    // All 3 failed: wait 4 000 ms, log to server console, give up.
    // -----------------------------------------------------------------------
    const delays = [1000, 2000, 4000];

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await compressionFn();
        return; // success — exit immediately
      } catch (err) {
        if (attempt < 2) {
          await new Promise<void>((resolve) => setTimeout(resolve, delays[attempt]));
        } else {
          // All 3 attempts exhausted — wait the final delay, then log and give up
          await new Promise<void>((resolve) => setTimeout(resolve, delays[attempt]));
          console.error(
            '[executeCompressionAsync] Memory compression failed after 3 retries:',
            err,
          );
        }
      }
    }
  } catch (err) {
    // Outer catch ensures this function never throws under any circumstances.
    console.error('[executeCompressionAsync] Unexpected error in compression executor:', err);
  }
}
