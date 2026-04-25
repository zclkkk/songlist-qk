import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

import type { Database } from '$lib/server/database.types';
import { getSupabaseConfig } from '$lib/server/env';

let supabaseAdmin: SupabaseClient<Database> | undefined;

export const getSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    const supabaseConfig = getSupabaseConfig();

    supabaseAdmin = createClient<Database>(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return supabaseAdmin;
};
