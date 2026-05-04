import { supabaseServer } from '@/lib/supabase/server';

const RATE_LIMIT_MAX = 60;
const WINDOW_DURATION_MS = 60 * 60 * 1000; // 60 minutes in milliseconds

/**
 * Finds the active rate limit window for a user, if one exists and has not expired.
 * A window is considered active if window_start is within the last 60 minutes.
 */
async function getActiveWindow(
  userId: string
): Promise<{ id: string; message_count: number; window_start: string } | null> {
  const windowCutoff = new Date(Date.now() - WINDOW_DURATION_MS).toISOString();

  const { data, error } = await supabaseServer
    .from('rate_limit_tracking')
    .select('id, message_count, window_start')
    .eq('user_id', userId)
    .gte('window_start', windowCutoff)
    .order('window_start', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to query rate_limit_tracking: ${error.message}`);
  }

  return data ?? null;
}

/**
 * checkRateLimit
 *
 * Checks whether the user is allowed to send another message within the current
 * 60-minute rolling window.
 *
 * - If no active window exists, the user is allowed (remaining = 60).
 * - If an active window exists, returns whether message_count < 60 and
 *   the number of remaining messages in the window.
 *
 * @param userId - The UUID of the user to check
 * @returns { allowed: boolean, remaining: number }
 */
export async function checkRateLimit(
  userId: string
): Promise<{ allowed: boolean; remaining: number }> {
  const window = await getActiveWindow(userId);

  if (!window) {
    return { allowed: true, remaining: RATE_LIMIT_MAX };
  }

  const remaining = Math.max(0, RATE_LIMIT_MAX - window.message_count);
  const allowed = window.message_count < RATE_LIMIT_MAX;

  return { allowed, remaining };
}

/**
 * recordMessage
 *
 * Increments the message_count for the user's current 60-minute window.
 * If no active window exists (either first message ever, or the previous window
 * has expired), a new window record is created with message_count = 1.
 *
 * Should be called after a message has been successfully sent.
 *
 * @param userId - The UUID of the user who sent the message
 */
export async function recordMessage(userId: string): Promise<void> {
  const window = await getActiveWindow(userId);

  if (window) {
    const { error } = await supabaseServer
      .from('rate_limit_tracking')
      .update({ message_count: window.message_count + 1 })
      .eq('id', window.id);

    if (error) {
      throw new Error(`Failed to increment message_count: ${error.message}`);
    }
  } else {
    const { error } = await supabaseServer
      .from('rate_limit_tracking')
      .insert({
        user_id: userId,
        window_start: new Date().toISOString(),
        message_count: 1,
      });

    if (error) {
      throw new Error(`Failed to create rate limit window: ${error.message}`);
    }
  }
}
