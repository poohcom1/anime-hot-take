#!/usr/bin/env tsx
import dotenv from "dotenv";
import {
  fetchAndCalculateHotTake,
  SCORES_COLLECTION,
} from "~/server/hotTakeLib";
import { getMongoClient } from "~/server/mongodb";

dotenv.config();

const mongoClient = getMongoClient();

console.log("Fetching db...");

const users = (await mongoClient
  .db(process.env.ENV)
  .collection(SCORES_COLLECTION)
  .find({})
  .toArray()) as unknown as DBUser[];

let count = 0;

console.log(`Updating ${users.length} entries...`);

for (const user of users) {
  const res = await fetchAndCalculateHotTake(user._id);
  if (res.ok) {
    count++;
    console.log(` > Updated ${count}/${users.length}`);
  } else {
    console.error(`[error] ${res.err}`);
  }
}

console.log(`Complete`);
process.exit(0);
