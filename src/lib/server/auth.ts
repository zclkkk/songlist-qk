import { createHmac, timingSafeEqual } from 'node:crypto';

import { dev } from '$app/environment';
import { env as privateEnv } from '$env/dynamic/private';
import { getSupabaseConfig } from '$lib/server/env';
import { createClient } from '@supabase/supabase-js';
import type { Cookies } from '@sveltejs/kit';

const sessionCookieName = 'songboard_admin_session';
const sessionMaxAgeSeconds = 60 * 60 * 24 * 7;

const getAuthSecret = () => {
  if (!privateEnv.AUTH_SECRET || privateEnv.AUTH_SECRET === 'replace-me') {
    throw new Error('AUTH_SECRET must be configured.');
  }

  return privateEnv.AUTH_SECRET;
};

const signValue = (value: string) => createHmac('sha256', getAuthSecret()).update(value).digest('hex');

const buildCookieValue = () => {
  const payload = `admin:${Date.now()}`;
  const signature = signValue(payload);
  return `${payload}.${signature}`;
};

export const setAdminSession = (cookies: Cookies) => {
  cookies.set(sessionCookieName, buildCookieValue(), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: !dev,
    maxAge: sessionMaxAgeSeconds
  });
};

export const clearAdminSession = (cookies: Cookies) => {
  cookies.delete(sessionCookieName, {
    path: '/'
  });
};

export const verifyAdminSession = (cookies: Cookies) => {
  const raw = cookies.get(sessionCookieName);

  if (!raw) {
    return false;
  }

  const lastDotIndex = raw.lastIndexOf('.');

  if (lastDotIndex === -1) {
    return false;
  }

  const payload = raw.slice(0, lastDotIndex);
  const signature = raw.slice(lastDotIndex + 1);
  const [subject, issuedAtRaw] = payload.split(':');
  const issuedAt = Number(issuedAtRaw);

  if (subject !== 'admin' || !Number.isFinite(issuedAt)) {
    return false;
  }

  if (Date.now() - issuedAt > sessionMaxAgeSeconds * 1000) {
    return false;
  }

  const expectedSignature = signValue(payload);
  const encoder = new TextEncoder();

  const left = encoder.encode(signature);
  const right = encoder.encode(expectedSignature);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
};

export const loginAdmin = async ({
  email,
  password
}: {
  email: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; message: string }> => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return {
      ok: false,
      message: '请填写邮箱和密码。'
    };
  }

  const supabaseConfig = getSupabaseConfig();
  const client = createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const { error } = await client.auth.signInWithPassword({
    email: normalizedEmail,
    password
  });

  if (error) {
    return {
      ok: false,
      message: '邮箱或密码错误。'
    };
  }

  return {
    ok: true
  };
};
