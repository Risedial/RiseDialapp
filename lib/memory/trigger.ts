import { supabaseServer } from '@/lib/supabase/server';

export interface CompressionTriggerResult {
  shouldCompress: boolean;
  isInitial: boolean;
  isPatch: boolean;
}

export async function checkCompressionTrigger(
  chatId: string,
  userId: string
): Promise<CompressionTriggerResult> {
  const { count, error } = await supabaseServer
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('chat_id', chatId)
    .eq('role', 'user')
    .not('user_message_index', 'is', null);

  if (error) {
    console.error('[checkCompressionTrigger] Supabase error:', error);
    return { shouldCompress: false, isInitial: false, isPatch: false };
  }

  const userMessageCount = count ?? 0;

  if (userMessageCount === 50) {
    return { shouldCompress: true, isInitial: true, isPatch: false };
  }

  if (userMessageCount > 50 && (userMessageCount - 50) % 10 === 0) {
    return { shouldCompress: true, isInitial: false, isPatch: true };
  }

  return { shouldCompress: false, isInitial: false, isPatch: false };
}
