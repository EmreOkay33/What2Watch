import { json } from '@sveltejs/kit';
import { connectDB, ObjectId } from '$lib/server/db.js';

export async function GET({ url, locals }) {
  if (!locals.user) return json({ users: [] }, { status: 401 });

  const q = url.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return json({ users: [] });

  const db = await connectDB();
  const users = await db.collection('users').find(
    {
      username: { $regex: q, $options: 'i' },
      _id: { $ne: new ObjectId(locals.user.id) }
    },
    { projection: { username: 1, avatar: 1 } }
  ).limit(8).toArray();

  return json({
    users: users.map(u => ({
      id: u._id.toString(),
      username: u.username,
      avatar: u.avatar ?? null
    }))
  });
}
