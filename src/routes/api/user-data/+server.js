import { json } from '@sveltejs/kit';
import { connectDB, ObjectId } from '$lib/server/db.js';

export async function GET({ locals }) {
  if (!locals.user) return json({ likedMovies: [], watchlist: [] });

  const db = await connectDB();
  const userDoc = await db.collection('users').findOne(
    { _id: new ObjectId(locals.user.id) },
    { projection: { likedMovies: 1, watchlist: 1, watched: 1 } }
  );

  return json({
    likedMovies: userDoc?.likedMovies ?? [],
    watchlist: userDoc?.watchlist ?? [],
    watched: userDoc?.watched ?? []
  });
}
