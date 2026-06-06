import { redirect } from '@sveltejs/kit';

export function load({ locals }) {
  if (!locals.user || locals.user.role !== 'admin') {
    redirect(303, '/');
  }
  return {};
}
