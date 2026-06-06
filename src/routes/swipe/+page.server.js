import { connectDB } from '$lib/server/db.js';
import { sampleMovies } from '$lib/movies.js';

export async function load() {
  try {
    const db = await connectDB();

    const [dbMovies, dbSeries] = await Promise.all([
      db.collection('movies').find({ type: { $ne: 'series' } }).toArray(),
      db.collection('movies').find({ type: 'series' }).toArray()
    ]);

    const toCard = m => ({
      id: m._id.toString(),
      title: m.title,
      year: m.year,
      genre: m.genre ?? 'Unbekannt',
      description: m.description ?? '',
      poster: m.poster ?? '',
      type: m.type ?? 'movie'
    });

    return {
      movies: dbMovies.length > 0 ? dbMovies.map(toCard) : sampleMovies.map(m => ({ ...m, type: 'movie' })),
      series: dbSeries.map(toCard)
    };
  } catch {
    return {
      movies: sampleMovies.map(m => ({ ...m, type: 'movie' })),
      series: []
    };
  }
}
