import { redirect, fail } from '@sveltejs/kit';
import { connectDB, ObjectId } from '$lib/server/db.js';

export async function load({ locals }) {
  if (!locals.user) redirect(303, '/login');

  const db = await connectDB();
  const userDoc = await db.collection('users').findOne(
    { _id: new ObjectId(locals.user.id) },
    { projection: { favoriteMovie: 1, favoriteSeries: 1, likedMovies: 1, avatar: 1 } }
  );

  const liked = userDoc?.likedMovies ?? [];
  return {
    user: locals.user,
    favoriteMovie: userDoc?.favoriteMovie ?? null,
    favoriteSeries: userDoc?.favoriteSeries ?? null,
    likedMoviesCount: liked.filter(m => !m.type || m.type === 'movie').length,
    likedSeriesCount: liked.filter(m => m.type === 'series').length,
    avatar: userDoc?.avatar ?? null
  };
}

export const actions = {
  uploadAvatar: async ({ request, locals }) => {
    if (!locals.user) return fail(401, {});
    const data = await request.formData();
    const file = data.get('avatar');
    if (!file || typeof file === 'string') return fail(400, { avatarError: 'Keine Datei' });
    if (file.size > 10 * 1024 * 1024) return fail(400, { avatarError: 'Bild max. 10 MB' });

    const buffer = await file.arrayBuffer();
    const base64 = `data:${file.type};base64,${Buffer.from(buffer).toString('base64')}`;

    const db = await connectDB();
    await db.collection('users').updateOne(
      { _id: new ObjectId(locals.user.id) },
      { $set: { avatar: base64 } }
    );
    return { avatarSaved: true };
  },

  removeAvatar: async ({ locals }) => {
    if (!locals.user) return fail(401, {});
    const db = await connectDB();
    await db.collection('users').updateOne(
      { _id: new ObjectId(locals.user.id) },
      { $unset: { avatar: '' } }
    );
    return { avatarRemoved: true };
  },

  saveFavorite: async ({ request, locals }) => {
    if (!locals.user) return fail(401, {});
    const data = await request.formData();
    const type = data.get('itemType')?.toString() ?? 'movie';
    const movieJson = data.get('movie')?.toString();
    if (!movieJson) return fail(400, {});

    let movie;
    try { movie = JSON.parse(movieJson); } catch { return fail(400, {}); }

    const field = type === 'series' ? 'favoriteSeries' : 'favoriteMovie';
    const db = await connectDB();
    await db.collection('users').updateOne(
      { _id: new ObjectId(locals.user.id) },
      { $set: { [field]: { id: movie.id, title: movie.title, year: movie.year, genre: movie.genre, poster: movie.poster, type: movie.type } } }
    );

    return { saved: true, savedType: type };
  },

  removeFavorite: async ({ request, locals }) => {
    if (!locals.user) return fail(401, {});
    const data = await request.formData();
    const type = data.get('itemType')?.toString() ?? 'movie';
    const field = type === 'series' ? 'favoriteSeries' : 'favoriteMovie';

    const db = await connectDB();
    await db.collection('users').updateOne(
      { _id: new ObjectId(locals.user.id) },
      { $unset: { [field]: '' } }
    );

    return { removed: true, removedType: type };
  }
};
