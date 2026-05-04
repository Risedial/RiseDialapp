import { supabaseServer } from '@/lib/supabase/server';

const RATE_LIMIT_MAX = 60;
const WINDOW_DURATION_MS = 60 * 60 * 1000; // 60 minutes in milliseconds

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

export async function recordMessage(userId: string): Promise<void> {
  const { error } = await supabaseServer.rpc('increment_message_count', {
    p_user_id: userId,
  });

  if (error) {
    throw new Error(`Failed to record message: ${error.message}`);
  }
}
