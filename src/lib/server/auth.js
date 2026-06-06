import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { connectDB, ObjectId } from './db.js';

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
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
