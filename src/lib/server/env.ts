import { AUTH_SECRET, SUPABASE_SECRET_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';

const requireEnv = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`${name} must be configured.`);
  }

  return value;
};

export const supabaseConfig = {
  url: requireEnv(PUBLIC_SUPABASE_URL, 'PUBLIC_SUPABASE_URL'),
  publishableKey: requireEnv(PUBLIC_SUPABASE_PUBLISHABLE_KEY, 'PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
  secretKey: requireEnv(SUPABASE_SECRET_KEY, 'SUPABASE_SECRET_KEY')
};

export const authSecret = requireEnv(AUTH_SECRET, 'AUTH_SECRET');
