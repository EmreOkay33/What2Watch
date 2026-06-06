import { json } from '@sveltejs/kit';
import { connectDB, ObjectId } from '$lib/server/db.js';

export async function POST({ request, locals }) {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

  const { movie, action } = await request.json();
  const db = await connectDB();

  if (action === 'remove') {
    await db.collection('users').updateOne(
      { _id: new ObjectId(locals.user.id) },
      { $pull: { likedMovies: { id: movie.id } } }
    );
  } else {
    await db.collection('users').updateOne(
      { _id: new ObjectId(locals.user.id) },
      { $addToSet: { likedMovies: { id: movie.id, title: movie.title, type: movie.type ?? 'movie', genre: movie.genre ?? '', year: movie.year ?? '', poster: movie.poster ?? '', description: movie.description ?? '' } } }
    );
  }

  return json({ ok: true });
}
