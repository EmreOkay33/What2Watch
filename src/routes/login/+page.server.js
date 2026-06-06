import { fail, redirect } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db.js';
import { verifyPassword, createSession } from '$lib/server/auth.js';

export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString().trim().toLowerCase();
    const password = data.get('password')?.toString();

    if (!email || !password) {
      return fail(400, { error: 'E-Mail und Passwort sind erforderlich.' });
    }

    const db = await connectDB();
    const user = await db.collection('users').findOne({ email });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return fail(400, { error: 'Falsche E-Mail-Adresse oder Passwort.' });
    }

    const token = await createSession(user._id);
    cookies.set('session_token', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    redirect(303, '/');
  }
};
