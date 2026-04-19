import { fail, redirect } from '@sveltejs/kit';

import { loginAdmin, setAdminSession } from '$lib/server/auth';

import type { Actions } from './$types';

const readText = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = readText(formData.get('email'));
    const password = readText(formData.get('password'));

    const result = await loginAdmin({ email, password });

    if (!result.ok) {
      return fail(400, {
        message: result.message,
        values: {
          email
        }
      });
    }

    setAdminSession(cookies);
    throw redirect(303, '/admin');
  }
};
