import { createClient } from '@supabase/supabase-js';

import type { Database } from '$lib/server/database.types';
import { supabaseConfig } from '$lib/server/env';

const sharedAuth = { persistSession: false, autoRefreshToken: false };

export const supabasePublic = createClient<Database>(supabaseConfig.url, supabaseConfig.publishableKey, {
  auth: sharedAuth
});

export const supabaseAdmin = createClient<Database>(supabaseConfig.url, supabaseConfig.secretKey, {
  auth: sharedAuth
});
