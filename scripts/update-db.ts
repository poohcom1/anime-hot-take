#!/usr/bin/env -S npx dotenv tsx
import { cursorTo } from "readline";
import {
  fetchAndCalculateHotTake,
  SCORES_COLLECTION,
} from "~/server/hotTakeLib";
import { getMongoClient } from "~/server/mongodb";

const mongoClient = getMongoClient();

console.log("Fetching db...");

const users = (await mongoClient
  .db(process.env.ENV)
  .collection(SCORES_COLLECTION)
  .find({})
  .toArray()) as unknown as DBUser[];

let count = 0;

console.log(`Updating ${users.length} entries:`);

for (const user of users) {
  const res = await fetchAndCalculateHotTake(user._id);
  if (res.ok) {
    count++;
    cursorTo(process.stdout, 0);
    process.stdout.write(
      ` > Updated ${((count / users.length) * 100).toFixed()}%`
    );
  }
}

console.log(`Complete`);
process.exit(0);
