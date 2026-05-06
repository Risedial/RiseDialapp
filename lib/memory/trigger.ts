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
  // Fetch all chat IDs for this user to enable cross-chat message counting.
  const { data: chats, error: chatError } = await supabaseServer
    .from('chats')
    .select('id')
    .eq('user_id', userId);

  if (chatError) {
    console.error('[checkCompressionTrigger] Failed to fetch chats for user:', chatError);
    return { shouldCompress: false, isInitial: false, isPatch: false };
  }

  const chatIds = (chats ?? []).map((c: { id: string }) => c.id);

  if (chatIds.length === 0) {
    return { shouldCompress: false, isInitial: false, isPatch: false };
  }

  const { count, error } = await supabaseServer
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('chat_id', chatIds)
    .eq('role', 'user')
    .not('user_message_index', 'is', null);

  if (error) {
    console.error('[checkCompressionTrigger] Supabase error:', error);
    return { shouldCompress: false, isInitial: false, isPatch: false };
  }

  const userMessageCount = count ?? 0;

  if (userMessageCount === 20) {
    return { shouldCompress: true, isInitial: true, isPatch: false };
  }

  if (userMessageCount > 20 && (userMessageCount - 20) % 5 === 0) {
    return { shouldCompress: true, isInitial: false, isPatch: true };
  }

  return { shouldCompress: false, isInitial: false, isPatch: false };
}
