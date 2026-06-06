import { connectDB } from '$lib/server/db.js';

export async function load() {
  try {
    const db = await connectDB();
    const docs = await db.collection('movies')
      .find({ poster: { $exists: true, $ne: '' } })
      .toArray();

    // Shuffle so every page load shows a different mix
    for (let i = docs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [docs[i], docs[j]] = [docs[j], docs[i]];
    }

    return { posterUrls: docs.slice(0, 12).map(d => d.poster) };
  } catch {
    return { posterUrls: [] };
  }
}
