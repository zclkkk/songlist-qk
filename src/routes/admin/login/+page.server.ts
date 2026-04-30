import { fail, redirect } from '@sveltejs/kit';

import { loginAdmin, setAdminSession } from '$lib/server/auth';
import { getValidationMessage } from '$lib/server/errors';
import { loginFormSchema } from '$lib/server/form-schemas';

import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const parsed = loginFormSchema.safeParse(await request.formData());

    if (!parsed.success) {
      return fail(400, {
        message: getValidationMessage(parsed.error),
        values: {
          email: ''
        }
      });
    }

    const { email, password } = parsed.data;

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
    redirect(303, '/admin');
  }
};
