import { redirect, fail, error } from '@sveltejs/kit';
import { connectDB, ObjectId } from '$lib/server/db.js';

export async function load({ locals, params }) {
  if (!locals.user) redirect(303, '/login');

  const { userId } = params;
  if (userId === locals.user.id) redirect(303, '/profile');

  let targetId;
  try { targetId = new ObjectId(userId); } catch { error(404, 'Benutzer nicht gefunden.'); }

  const db = await connectDB();
  const myId = new ObjectId(locals.user.id);

  const [targetDoc, myDoc, friendship] = await Promise.all([
    db.collection('users').findOne(
      { _id: targetId },
      { projection: { passwordHash: 0 } }
    ),
    db.collection('users').findOne(
      { _id: myId },
      { projection: { likedMovies: 1 } }
    ),
    db.collection('friendships').findOne({
      $or: [
        { fromId: myId, toId: targetId },
        { fromId: targetId, toId: myId }
      ]
    })
  ]);

  if (!targetDoc) error(404, 'Benutzer nicht gefunden.');

  // Determine relationship
  let relationshipStatus = 'none';
  let friendshipId = null;

  if (friendship) {
    friendshipId = friendship._id.toString();
    if (friendship.status === 'accepted') {
      relationshipStatus = 'friends';
    } else if (friendship.status === 'pending') {
      relationshipStatus = friendship.fromId.toString() === locals.user.id
        ? 'pending_out'
        : 'pending_in';
    }
  }

  const areFriends = relationshipStatus === 'friends';

  // Shared movies (only when friends)
  const myLiked = myDoc?.likedMovies ?? [];
  const friendLiked = areFriends ? (targetDoc.likedMovies ?? []) : [];
  const myLikedIds = new Set(myLiked.map(m => m.id));
  const shared = friendLiked.filter(m => myLikedIds.has(m.id));

  return {
    friendUser: {
      id: targetDoc._id.toString(),
      username: targetDoc.username,
      avatar: areFriends ? (targetDoc.avatar ?? null) : null,
      favoriteMovie:  areFriends ? (targetDoc.favoriteMovie  ?? null) : null,
      favoriteSeries: areFriends ? (targetDoc.favoriteSeries ?? null) : null,
      likedMoviesCount: areFriends ? (targetDoc.likedMovies ?? []).filter(m => !m.type || m.type === 'movie').length : null,
      likedSeriesCount: areFriends ? (targetDoc.likedMovies ?? []).filter(m => m.type === 'series').length : null
    },
    relationshipStatus,
    friendshipId,
    sharedMovies:  shared.filter(m => !m.type || m.type === 'movie'),
    sharedSeries:  shared.filter(m => m.type === 'series')
  };
}

export const actions = {
  sendRequest: async ({ request, locals, params }) => {
    if (!locals.user) return fail(401, {});
    const { userId } = params;
    if (userId === locals.user.id) return fail(400, {});

    let targetId;
    try { targetId = new ObjectId(userId); } catch { return fail(400, {}); }

    const db = await connectDB();
    const myId = new ObjectId(locals.user.id);

    const existing = await db.collection('friendships').findOne({
      $or: [{ fromId: myId, toId: targetId }, { fromId: targetId, toId: myId }]
    });
    if (existing) return fail(400, { error: 'Anfrage bereits vorhanden.' });

    await db.collection('friendships').insertOne({
      fromId: myId, toId: targetId, status: 'pending', createdAt: new Date()
    });
    return { sent: true };
  },

  cancelRequest: async ({ request, locals, params }) => {
    if (!locals.user) return fail(401, {});
    const { userId } = params;

    let targetId;
    try { targetId = new ObjectId(userId); } catch { return fail(400, {}); }

    const db = await connectDB();
    const myId = new ObjectId(locals.user.id);
    await db.collection('friendships').deleteOne({
      fromId: myId, toId: targetId, status: 'pending'
    });
    return { cancelled: true };
  },

  acceptRequest: async ({ request, locals, params }) => {
    if (!locals.user) return fail(401, {});
    const data = await request.formData();
    const friendshipId = data.get('friendshipId')?.toString();
    if (!friendshipId) return fail(400, {});
    const db = await connectDB();
    await db.collection('friendships').updateOne(
      { _id: new ObjectId(friendshipId), toId: new ObjectId(locals.user.id), status: 'pending' },
      { $set: { status: 'accepted', acceptedAt: new Date() } }
    );
    return { accepted: true };
  },

  rejectRequest: async ({ request, locals }) => {
    if (!locals.user) return fail(401, {});
    const data = await request.formData();
    const friendshipId = data.get('friendshipId')?.toString();
    if (!friendshipId) return fail(400, {});
    const db = await connectDB();
    await db.collection('friendships').deleteOne({
      _id: new ObjectId(friendshipId),
      toId: new ObjectId(locals.user.id)
    });
    return { rejected: true };
  },

  removeFriend: async ({ request, locals }) => {
    if (!locals.user) return fail(401, {});
    const data = await request.formData();
    const friendshipId = data.get('friendshipId')?.toString();
    if (!friendshipId) return fail(400, {});
    const db = await connectDB();
    const myId = new ObjectId(locals.user.id);
    await db.collection('friendships').deleteOne({
      _id: new ObjectId(friendshipId),
      $or: [{ fromId: myId }, { toId: myId }]
    });
    return { removed: true };
  }
};
