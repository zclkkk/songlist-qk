import { createHmac, timingSafeEqual } from 'node:crypto';

import { dev } from '$app/environment';
import { getAuthSecret } from '$lib/server/env';
import { getSupabasePublic } from '$lib/server/supabase';
import type { Cookies } from '@sveltejs/kit';

const sessionCookieName = 'songlist_admin_session';
const sessionMaxAgeSeconds = 60 * 60 * 24 * 7;

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

  const [payload, signature] = raw.split('.');

  if (!payload || !signature) {
    return false;
  }

  const provided = Buffer.from(signature, 'hex');
  const expected = Buffer.from(signValue(payload), 'hex');

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return false;
  }

  const issuedAt = Number(payload.split(':')[1]);

  return Date.now() - issuedAt <= sessionMaxAgeSeconds * 1000;
};

export const loginAdmin = async ({
  email,
  password
}: {
  email: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; message: string }> => {
  const { error } = await getSupabasePublic().auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password
  });

  if (error) {
    return {
      ok: false,
      message: '邮箱或密码错误。'
    };
  }

  return { ok: true };
};
