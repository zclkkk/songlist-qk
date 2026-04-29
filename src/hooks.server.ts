import { redirect, type Handle, type ServerInit } from '@sveltejs/kit';

import { verifyAdminSession } from '$lib/server/auth';
import { getAuthSecret, getSupabaseConfig } from '$lib/server/env';

export const init: ServerInit = () => {
  getSupabaseConfig();
  getAuthSecret();
};

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.isAdmin = verifyAdminSession(event.cookies);

  const pathname = event.url.pathname;
  const isAdminArea = pathname === '/admin' || pathname.startsWith('/admin/');
  const isLoginPage = pathname === '/admin/login';

  if (isAdminArea && !isLoginPage && !event.locals.isAdmin) {
    redirect(303, '/admin/login');
  }

  if (isLoginPage && event.locals.isAdmin) {
    redirect(303, '/admin');
  }

  return resolve(event);
};
