import { MongoClient } from "mongodb";

let clientCache: MongoClient | undefined;

export function getMongoClient() {
  if (clientCache) return clientCache;

  clientCache = new MongoClient(import.meta.env.VITE_MONGO_DB_URL);

  return clientCache;
}
