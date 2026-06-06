import { connectDB, ObjectId } from '$lib/server/db.js';
import { getTmdbDetails } from '$lib/server/tmdb.js';
import { sampleMovies } from '$lib/movies.js';

export async function load({ params }) {
  const { id } = params;
  let movie = null;

  // MongoDB-Film laden
  if (id && !id.startsWith('custom-')) {
    try {
      const db = await connectDB();
      const doc = await db.collection('movies').findOne({ _id: new ObjectId(id) });
      if (doc) {
        movie = {
          id: doc._id.toString(),
          title: doc.title,
          year: doc.year,
          genre: doc.genre ?? 'Unbekannt',
          description: doc.description ?? '',
          poster: doc.poster ?? '',
          type: doc.type ?? 'movie'
        };
      }
    } catch {}
  }

  // Fallback: sampleMovies
  if (!movie) {
    const found = sampleMovies.find(m => m.id === id);
    if (found) movie = { ...found, type: found.type ?? 'movie' };
  }

  if (!movie) return { movie: null, tmdb: null };

  // TMDB-Daten laden (Cast, Laufzeit, Anbieter)
  const tmdb = await getTmdbDetails(movie.title, movie.year, movie.type);

  return { movie, tmdb };
}
