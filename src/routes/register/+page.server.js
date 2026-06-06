import { fail, redirect } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db.js';
import { hashPassword, createSession } from '$lib/server/auth.js';

export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString().trim().toLowerCase();
    const username = data.get('username')?.toString().trim();
    const password = data.get('password')?.toString();
    const confirmPassword = data.get('confirmPassword')?.toString();

    if (!email || !username || !password) {
      return fail(400, { error: 'Alle Felder sind erforderlich.' });
    }
    if (password !== confirmPassword) {
      return fail(400, { error: 'Passwörter stimmen nicht überein.' });
    }
    if (password.length < 6) {
      return fail(400, { error: 'Passwort muss mindestens 6 Zeichen lang sein.' });
    }

    const db = await connectDB();

    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      return fail(400, { error: 'Diese E-Mail-Adresse ist bereits registriert.' });
    }

    const passwordHash = await hashPassword(password);
    const userCount = await db.collection('users').countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';

    const result = await db.collection('users').insertOne({
      email,
      username,
      passwordHash,
      role,
      createdAt: new Date()
    });

    const token = await createSession(result.insertedId);
    cookies.set('session_token', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    redirect(303, '/');
  }
};
