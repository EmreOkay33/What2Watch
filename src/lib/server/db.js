import { MongoClient, ObjectId } from 'mongodb';
import { env } from '$env/dynamic/private';

let client;

async function getClient() {
  if (!client) {
    client = new MongoClient(env.MONGODB_URI);
    await client.connect();
  }
  return client;
}

export async function connectDB() {
  const c = await getClient();
  return c.db(env.MONGODB_DB ?? 'what2watch');
}

export { ObjectId };
