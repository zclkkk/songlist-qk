import { getSupabaseConfig } from '$lib/server/env';
import { createClient } from '@supabase/supabase-js';

let supabaseAdmin: ReturnType<typeof createClient> | undefined;

export const getSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    const supabaseConfig = getSupabaseConfig();

    supabaseAdmin = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return supabaseAdmin;
};
