import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb+srv://Emre:Marvel.33@cluster0.phxqk8h.mongodb.net/?appName=Cluster0';
const DB_NAME = 'what2watch';

const ADMIN_EMAIL    = 'admin@what2watch.ch';
const ADMIN_USERNAME = 'Admin';
const ADMIN_PASSWORD = 'Admin@2024';

async function run() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const users = db.collection('users');

    const existing = await users.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      // Update role to admin and reset password in case it changed
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await users.updateOne({ email: ADMIN_EMAIL }, { $set: { role: 'admin', passwordHash, username: ADMIN_USERNAME } });
      console.log('✓ Admin-Benutzer aktualisiert.');
    } else {
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await users.insertOne({
        email: ADMIN_EMAIL,
        username: ADMIN_USERNAME,
        passwordHash,
        role: 'admin',
        createdAt: new Date()
      });
      console.log('✓ Admin-Benutzer erstellt.');
    }

    console.log(`\n  E-Mail:   ${ADMIN_EMAIL}`);
    console.log(`  Passwort: ${ADMIN_PASSWORD}\n`);
  } finally {
    await client.close();
  }
}

run().catch(console.error);
