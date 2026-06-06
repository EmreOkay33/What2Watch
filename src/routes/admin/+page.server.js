import { fail, redirect } from '@sveltejs/kit';
import { connectDB, ObjectId } from '$lib/server/db.js';
import { hashPassword } from '$lib/server/auth.js';

export async function load() {
  const db = await connectDB();

  const users = await db.collection('users')
    .find({}, { projection: { passwordHash: 0 } })
    .toArray();

  const movies = await db.collection('movies').find({}).toArray();

  return {
    users: users.map(u => ({ ...u, _id: u._id.toString() })),
    movies: movies.map(m => ({ ...m, _id: m._id.toString() }))
  };
}

export const actions = {
  deleteUser: async ({ request, locals }) => {
    const data = await request.formData();
    const userId = data.get('userId');

    if (userId === locals.user?.id) {
      return fail(400, { error: 'Du kannst dein eigenes Konto nicht löschen.' });
    }

    const db = await connectDB();
    await db.collection('users').deleteOne({ _id: new ObjectId(userId) });
    await db.collection('sessions').deleteMany({ userId: new ObjectId(userId) });

    return { success: true };
  },

  changeRole: async ({ request }) => {
    const data = await request.formData();
    const userId = data.get('userId');
    const role = data.get('role');

    if (!['admin', 'user'].includes(role)) {
      return fail(400, { error: 'Ungültige Rolle.' });
    }

    const db = await connectDB();
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role } }
    );

    return { success: true };
  },

  addMovie: async ({ request }) => {
    const data = await request.formData();
    const title       = data.get('title')?.toString().trim();
    const year        = parseInt(data.get('year')?.toString() ?? '');
    const genre       = data.get('genre')?.toString().trim();
    const type        = data.get('type')?.toString() ?? 'movie';
    const description = data.get('description')?.toString().trim() ?? '';

    if (!title) return fail(400, { movieError: 'Titel ist erforderlich.' });
    if (!year || year < 1888 || year > 2100) return fail(400, { movieError: 'Ungültiges Jahr.' });
    if (!genre) return fail(400, { movieError: 'Genre ist erforderlich.' });

    const poster = data.get('poster')?.toString().trim() || '';

    const db = await connectDB();
    await db.collection('movies').insertOne({
      title, year,
      genre: genre || 'Unbekannt',
      type,
      description,
      poster,
      createdAt: new Date()
    });

    return { movieSuccess: true };
  },

  deleteMovie: async ({ request }) => {
    const data = await request.formData();
    const movieId = data.get('movieId');

    const db = await connectDB();
    await db.collection('movies').deleteOne({ _id: new ObjectId(movieId) });

    return { success: true };
  }
};
