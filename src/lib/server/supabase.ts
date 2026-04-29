import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

import type { Database } from '$lib/server/database.types';
import { getSupabaseConfig } from '$lib/server/env';

let supabasePublic: SupabaseClient<Database> | undefined;
let supabaseAdmin: SupabaseClient<Database> | undefined;

export const getSupabasePublic = () => {
  if (!supabasePublic) {
    const supabaseConfig = getSupabaseConfig();

    supabasePublic = createClient<Database>(supabaseConfig.url, supabaseConfig.publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return supabasePublic;
};

export const getSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    const supabaseConfig = getSupabaseConfig();

    supabaseAdmin = createClient<Database>(supabaseConfig.url, supabaseConfig.secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return supabaseAdmin;
};
