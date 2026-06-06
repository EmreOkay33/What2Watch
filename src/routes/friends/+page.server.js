import { redirect, fail } from '@sveltejs/kit';
import { connectDB, ObjectId } from '$lib/server/db.js';

export async function load({ locals }) {
  if (!locals.user) redirect(303, '/login');

  const db = await connectDB();
  const myId = new ObjectId(locals.user.id);

  const allFs = await db.collection('friendships').find({
    $or: [{ fromId: myId }, { toId: myId }]
  }).toArray();

  const accepted       = allFs.filter(f => f.status === 'accepted');
  const incomingPending = allFs.filter(f => f.status === 'pending' && f.toId.toString() === locals.user.id);
  const outgoingPending = allFs.filter(f => f.status === 'pending' && f.fromId.toString() === locals.user.id);

  const friendIds = accepted.map(f =>
    f.fromId.toString() === locals.user.id ? f.toId : f.fromId
  );

  const [friendDocs, senderDocs] = await Promise.all([
    friendIds.length > 0
      ? db.collection('users').find({ _id: { $in: friendIds } }, { projection: { username: 1, avatar: 1 } }).toArray()
      : [],
    incomingPending.length > 0
      ? db.collection('users').find({ _id: { $in: incomingPending.map(f => f.fromId) } }, { projection: { username: 1, avatar: 1 } }).toArray()
      : []
  ]);

  return {
    friends: accepted.map(fs => {
      const fid = fs.fromId.toString() === locals.user.id ? fs.toId.toString() : fs.fromId.toString();
      const doc = friendDocs.find(d => d._id.toString() === fid);
      return { friendshipId: fs._id.toString(), userId: fid, username: doc?.username ?? '?', avatar: doc?.avatar ?? null };
    }),
    pendingIncoming: incomingPending.map(fs => {
      const doc = senderDocs.find(d => d._id.toString() === fs.fromId.toString());
      return { friendshipId: fs._id.toString(), userId: fs.fromId.toString(), username: doc?.username ?? '?', avatar: doc?.avatar ?? null };
    }),
    pendingOutgoingIds: outgoingPending.map(fs => fs.toId.toString())
  };
}

export const actions = {
  acceptRequest: async ({ request, locals }) => {
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
