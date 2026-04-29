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

  const lastDotIndex = raw.lastIndexOf('.');

  if (lastDotIndex === -1) {
    return false;
  }

  const payload = raw.slice(0, lastDotIndex);
  const signature = raw.slice(lastDotIndex + 1);
  const provided = Buffer.from(signature, 'hex');
  const expected = Buffer.from(signValue(payload), 'hex');

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return false;
  }

  const [subject, issuedAtValue] = payload.split(':');

  if (subject !== 'admin') {
    return false;
  }

  return Date.now() - Number(issuedAtValue) <= sessionMaxAgeSeconds * 1000;
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

  const client = getSupabasePublic();

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
