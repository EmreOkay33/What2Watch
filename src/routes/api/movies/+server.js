import { json } from '@sveltejs/kit';
import { connectDB } from '$lib/db';

export async function GET() {
  const db = await connectDB();
  const movies = await db.collection("movies").find({ favorite: true }).toArray();
  return json(movies);
}

export async function POST({ request }) {
  const data = await request.json();

  const db = await connectDB();
  await db.collection("movies").insertOne(data);

  return json({ success: true });
}