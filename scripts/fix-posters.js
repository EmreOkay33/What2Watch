import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://Emre:Marvel.33@cluster0.phxqk8h.mongodb.net/?appName=Cluster0';
const DB_NAME = 'what2watch';
const TMDB_API_KEY = 'a6548c65e8d0ea387519c9db3ce3de82';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

async function getPoster(title, year, type) {
  try {
    const isMovie = type !== 'series';
    const endpoint = isMovie ? '/search/movie' : '/search/tv';
    const yearParam = isMovie ? `year=${year}` : `first_air_date_year=${year}`;

    const url = `${TMDB_BASE}${endpoint}?api_key=${TMDB_API_KEY}&language=de-DE&query=${encodeURIComponent(title)}&${yearParam}`;
    const res = await fetch(url);
    const data = await res.json();

    const match = data.results?.[0];
    if (match?.poster_path) return `${TMDB_IMG}${match.poster_path}`;

    // Zweiter Versuch: ohne Jahr-Filter (hilft bei Anime mit abweichenden Jahreszahlen)
    const url2 = `${TMDB_BASE}${endpoint}?api_key=${TMDB_API_KEY}&language=de-DE&query=${encodeURIComponent(title)}`;
    const res2 = await fetch(url2);
    const data2 = await res2.json();
    const match2 = data2.results?.[0];
    if (match2?.poster_path) return `${TMDB_IMG}${match2.poster_path}`;

    return null;
  } catch {
    return null;
  }
}

async function fixPosters() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Verbunden mit MongoDB...\n');

    const db = client.db(DB_NAME);
    const collection = db.collection('movies');

    const all = await collection.find({}).toArray();
    console.log(`${all.length} Einträge gefunden.\n`);

    let updated = 0;
    let failed = 0;

    for (const doc of all) {
      const poster = await getPoster(doc.title, doc.year, doc.type);

      if (poster) {
        await collection.updateOne({ _id: doc._id }, { $set: { poster } });
        console.log(`✓  ${doc.title} (${doc.year})`);
        updated++;
      } else {
        console.log(`✗  ${doc.title} (${doc.year}) — kein Poster gefunden`);
        failed++;
      }

      // 120ms Pause — TMDB Rate-Limit vermeiden
      await new Promise(r => setTimeout(r, 120));
    }

    console.log(`\nFertig: ${updated} aktualisiert, ${failed} nicht gefunden.`);
  } finally {
    await client.close();
  }
}

fixPosters().catch(console.error);
