#!/usr/bin/env -S npx dotenv tsx
import fs from "fs";
import path from "path";
import { MongoMemoryServer } from "mongodb-memory-server";
import { calculateScore, SCORES_COLLECTION } from "~/server/calculations";
import type { AnimeList } from "~/server/mal";
import { MongoClient, OptionalId } from "mongodb";

const MOCK_DATA_FILE = "mock_data.json";

const mongodb = await MongoMemoryServer.create({ instance: { port: 27017 } });

const filePath = path.join("scripts", MOCK_DATA_FILE);

if (fs.existsSync(filePath)) {
  const userData: Record<string, AnimeList> = JSON.parse(
    fs.readFileSync(filePath).toString()
  );

  const entries = Object.entries(userData).map(
    ([username, user]) =>
      <DBUser>{
        _id: username,
        // @ts-ignore
        score: calculateScore(user.data).score,
      }
  );

  const client = new MongoClient(mongodb.getUri());

  await client
    .db()
    .collection(SCORES_COLLECTION)
    .insertMany(entries as unknown as OptionalId<Document>[]);
}

console.log("MongoDB memory server running at: " + mongodb.getUri());
