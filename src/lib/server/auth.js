import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { connectDB, ObjectId } from './db.js';

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export async function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const hashBuffer = Buffer.from(hash, 'hex');
  const derived = scryptSync(password, salt, 64);
  return timingSafeEqual(hashBuffer, derived);
}

export async function createSession(userId) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const db = await connectDB();
  await db.collection('sessions').insertOne({ token, userId, expiresAt });

  return token;
}

export async function deleteSession(token) {
  const db = await connectDB();
  await db.collection('sessions').deleteOne({ token });
}

export async function getSessionUser(token) {
  const db = await connectDB();

  const session = await db.collection('sessions').findOne({
    token,
    expiresAt: { $gt: new Date() }
  });
  if (!session) return null;

  const user = await db.collection('users').findOne({ _id: session.userId });
  if (!user) return null;

  return {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    role: user.role
  };
}
