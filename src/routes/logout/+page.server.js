import { redirect } from '@sveltejs/kit';
import { deleteSession } from '$lib/server/auth.js';

export const actions = {
  default: async ({ cookies }) => {
    const token = cookies.get('session_token');
    if (token) {
      await deleteSession(token);
      cookies.delete('session_token', { path: '/' });
    }
    redirect(303, '/login');
  }
};
