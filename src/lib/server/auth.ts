import { createHmac, timingSafeEqual } from 'node:crypto';

import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { createClient } from '@supabase/supabase-js';
import type { Cookies } from '@sveltejs/kit';

const sessionCookieName = 'songboard_admin_session';
const defaultAdminEmail = 'admin@example.com';
const defaultAdminPassword = 'demo-admin';
const sessionMaxAgeSeconds = 60 * 60 * 24 * 7;

type AuthMode = 'demo' | 'supabase';

const isProduction = () => privateEnv.NODE_ENV === 'production';

const isDemoAuthEnabled = () => !isProduction() || privateEnv.ENABLE_DEMO_AUTH === 'true';

const requireDemoAuthEnabled = () => {
  if (!isDemoAuthEnabled()) {
    throw new Error('Demo admin auth is disabled. Configure Supabase auth or set ENABLE_DEMO_AUTH=true.');
  }
};

const getAuthSecret = () => {
  if (!privateEnv.AUTH_SECRET || privateEnv.AUTH_SECRET === 'replace-me') {
    if (isProduction()) {
      throw new Error('AUTH_SECRET must be configured in production.');
    }

    return 'songboard-local-secret';
  }

  return privateEnv.AUTH_SECRET;
};

const getAdminEmail = () => privateEnv.ADMIN_EMAIL || defaultAdminEmail;

const signValue = (value: string) => createHmac('sha256', getAuthSecret()).update(value).digest('hex');

const buildCookieValue = () => {
  const payload = `admin:${Date.now()}`;
  const signature = signValue(payload);
  return `${payload}.${signature}`;
};

const hasSupabaseAuth = () =>
  Boolean(
    publicEnv.PUBLIC_SUPABASE_URL &&
      publicEnv.PUBLIC_SUPABASE_ANON_KEY &&
      privateEnv.SUPABASE_SERVICE_ROLE_KEY
  );

export const getAuthMode = (): AuthMode => {
  if (hasSupabaseAuth()) {
    return 'supabase';
  }

  requireDemoAuthEnabled();
  return 'demo';
};

export const getDemoCredentials = () => {
  requireDemoAuthEnabled();

  return {
    email: getAdminEmail(),
    password: privateEnv.ADMIN_PASSWORD || defaultAdminPassword
  };
};

export const setAdminSession = (cookies: Cookies) => {
  cookies.set(sessionCookieName, buildCookieValue(), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction(),
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
}): Promise<{ ok: true; mode: AuthMode } | { ok: false; message: string }> => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (!normalizedEmail || !normalizedPassword) {
    return {
      ok: false,
      message: '请填写邮箱和密码。'
    };
  }

  if (hasSupabaseAuth()) {
    const adminEmail = getAdminEmail().toLowerCase();

    if (normalizedEmail !== adminEmail) {
      return {
        ok: false,
        message: '该账号不是管理员账号。'
      };
    }

    const client = createClient(publicEnv.PUBLIC_SUPABASE_URL!, publicEnv.PUBLIC_SUPABASE_ANON_KEY!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const { error } = await client.auth.signInWithPassword({
      email: normalizedEmail,
      password: normalizedPassword
    });

    if (error) {
      return {
        ok: false,
        message: error.message || '管理员登录失败。'
      };
    }

    return {
      ok: true,
      mode: 'supabase'
    };
  }

  const demoCredentials = getDemoCredentials();

  if (
    normalizedEmail !== demoCredentials.email.toLowerCase() ||
    normalizedPassword !== demoCredentials.password
  ) {
    return {
      ok: false,
      message: '演示账号或密码不正确。'
    };
  }

  return {
    ok: true,
    mode: 'demo'
  };
};
