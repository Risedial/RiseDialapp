import { supabaseServer } from '../supabase/server';

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  deleted_at: string | null;
}

/**
 * Fetch all non-deleted chats for a given user, ordered by creation date descending.
 * Excludes any rows where deleted_at is set.
 */
export async function getChatsByUserId(userId: string): Promise<Chat[]> {
  const { data, error } = await supabaseServer
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`getChatsByUserId failed: ${error.message}`);
  }

  return (data ?? []) as Chat[];
}

/**
 * Fetch a single chat by its UUID.
 * Returns the Chat row or null if not found.
 */
export async function getChatById(id: string): Promise<Chat | null> {
  const { data, error } = await supabaseServer
    .from('chats')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`getChatById failed: ${error.message}`);
  }

  return data as Chat;
}

/**
 * Create a new chat row for the given user with the provided title.
 * Returns the created Chat row.
 */
export async function createChat(userId: string, title: string): Promise<Chat> {
  const { data, error } = await supabaseServer
    .from('chats')
    .insert({ user_id: userId, title })
    .select('*')
    .single();

  if (error) {
    throw new Error(`createChat failed: ${error.message}`);
  }

  return data as Chat;
}

/**
 * Soft-delete a chat by setting deleted_at to the current timestamp.
 * The row remains in the database for memory preservation purposes.
 */
export async function softDeleteChat(id: string): Promise<void> {
  const { error } = await supabaseServer
    .from('chats')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(`softDeleteChat failed: ${error.message}`);
  }
}
