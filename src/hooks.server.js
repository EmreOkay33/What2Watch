import { getSessionUser } from '$lib/server/auth.js';

export async function handle({ event, resolve }) {
  const token = event.cookies.get('session_token');

  if (token) {
    try {
      event.locals.user = await getSessionUser(token);
    } catch {
      event.locals.user = null;
    }
  } else {
    event.locals.user = null;
  }

  return resolve(event);
}
