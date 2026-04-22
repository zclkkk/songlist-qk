import { getSupabaseAdmin } from '$lib/server/supabase';

export const consumeRequestRateLimit = async ({
  clientKey,
  maxRequests,
  windowMs
}: {
  clientKey: string;
  maxRequests: number;
  windowMs: number;
}) => {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc('consume_request_rate_limit', {
    p_client_key: clientKey,
    p_max_requests: maxRequests,
    p_window_seconds: Math.ceil(windowMs / 1000)
  });

  if (error) {
    throw new Error(error.message);
  }

  return data === true;
};
