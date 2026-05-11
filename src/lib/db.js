import { MongoClient } from "mongodb";

const uri = "mongodb+srv://Emre:Marvel.33@cluster0.phxqk8h.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri);

export async function connectDB() {
  await client.connect();
  return client.db("what2watch");
}