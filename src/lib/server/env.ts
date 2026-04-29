import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

const requireEnv = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`${name} must be configured.`);
  }

  return value;
};

let cachedConfig: { url: string; publishableKey: string; secretKey: string } | undefined;

export const getSupabaseConfig = () => {
  if (!cachedConfig) {
    cachedConfig = {
      url: requireEnv(publicEnv.PUBLIC_SUPABASE_URL, 'PUBLIC_SUPABASE_URL'),
      publishableKey: requireEnv(publicEnv.PUBLIC_SUPABASE_PUBLISHABLE_KEY, 'PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
      secretKey: requireEnv(privateEnv.SUPABASE_SECRET_KEY, 'SUPABASE_SECRET_KEY')
    };
  }

  return cachedConfig;
};

export const getAuthSecret = () => requireEnv(privateEnv.AUTH_SECRET, 'AUTH_SECRET');
