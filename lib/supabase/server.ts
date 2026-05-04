import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

/**
 * Supabase service role client.
 * Bypasses Row Level Security — use only in server-side API routes.
 * Never expose this client or its key to the browser.
 */
export const supabaseServer = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
