import { supabaseServer } from '../supabase/server';

export interface MemoryProfile {
  id: string;
  user_id: string;
  profile_json: object;
  source_chats: object;
  version: number;
  generated_at: string;
  last_updated_at: string;
  model_used: string;
}

/**
 * Fetch the memory profile for a given user.
 * Returns the MemoryProfile row or null if one does not yet exist.
 */
export async function getMemoryProfileByUserId(userId: string): Promise<MemoryProfile | null> {
  const { data, error } = await supabaseServer
    .from('memory_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`getMemoryProfileByUserId failed: ${error.message}`);
  }

  return data as MemoryProfile;
}

/**
 * Insert a new memory profile for a user.
 * Each user may have at most one profile (enforced by the UNIQUE constraint on user_id).
 * Returns the created MemoryProfile row.
 */
export async function createMemoryProfile(
  userId: string,
  profileJson: object,
  modelUsed: string
): Promise<MemoryProfile> {
  const { data, error } = await supabaseServer
    .from('memory_profiles')
    .insert({
      user_id: userId,
      profile_json: profileJson,
      model_used: modelUsed,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`createMemoryProfile failed: ${error.message}`);
  }

  return data as MemoryProfile;
}

/**
 * Update an existing memory profile for a user.
 * Increments the version counter and refreshes last_updated_at.
 * Returns the updated MemoryProfile row.
 */
export async function updateMemoryProfile(
  userId: string,
  profileJson: object,
  modelUsed: string
): Promise<MemoryProfile> {
  const { data: existing, error: fetchError } = await supabaseServer
    .from('memory_profiles')
    .select('version')
    .eq('user_id', userId)
    .single();

  if (fetchError) {
    throw new Error(`updateMemoryProfile (fetch version) failed: ${fetchError.message}`);
  }

  const nextVersion = ((existing as { version: number }).version ?? 1) + 1;

  const { data, error } = await supabaseServer
    .from('memory_profiles')
    .update({
      profile_json: profileJson,
      model_used: modelUsed,
      version: nextVersion,
      last_updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`updateMemoryProfile failed: ${error.message}`);
  }

  return data as MemoryProfile;
}
