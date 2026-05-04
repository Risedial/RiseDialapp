import { supabaseServer } from '../supabase/server';

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  user_message_index: number | null;
}

/**
 * Fetch messages for a given chat, ordered by creation date ascending.
 * Optionally limits the number of rows returned (most recent N messages).
 */
export async function getMessagesByChatId(
  chatId: string,
  limit?: number
): Promise<Message[]> {
  let query = supabaseServer
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (limit !== undefined && limit > 0) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`getMessagesByChatId failed: ${error.message}`);
  }

  return (data ?? []) as Message[];
}

/**
 * Insert a new message into the specified chat.
 * Returns the created Message row.
 */
export async function createMessage(
  chatId: string,
  role: 'user' | 'assistant',
  content: string,
  userMessageIndex?: number
): Promise<Message> {
  const payload: {
    chat_id: string;
    role: 'user' | 'assistant';
    content: string;
    user_message_index?: number;
  } = { chat_id: chatId, role, content };

  if (userMessageIndex !== undefined) {
    payload.user_message_index = userMessageIndex;
  }

  const { data, error } = await supabaseServer
    .from('messages')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    throw new Error(`createMessage failed: ${error.message}`);
  }

  return data as Message;
}

/**
 * Hard-delete all messages belonging to a given chat.
 * Used during chat cleanup after memory compression.
 */
export async function deleteMessagesByChatId(chatId: string): Promise<void> {
  const { error } = await supabaseServer
    .from('messages')
    .delete()
    .eq('chat_id', chatId);

  if (error) {
    throw new Error(`deleteMessagesByChatId failed: ${error.message}`);
  }
}

/**
 * Count the number of user-role messages in a given chat.
 * Used by the rate limiting layer to track message consumption.
 */
export async function countUserMessagesByChatId(chatId: string): Promise<number> {
  const { count, error } = await supabaseServer
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('chat_id', chatId)
    .eq('role', 'user');

  if (error) {
    throw new Error(`countUserMessagesByChatId failed: ${error.message}`);
  }

  return count ?? 0;
}
