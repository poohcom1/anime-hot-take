import { MongoClient } from "mongodb";

let clientCache: MongoClient | undefined;

export function getMongoClient() {
  if (clientCache) return clientCache;

  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL not set!");
  }
  clientCache = new MongoClient(process.env.MONGODB_URL!);

  return clientCache;
}
