#!/usr/bin/env -S npx dotenv tsx
import fs from "fs";
import { cursorTo } from "readline";
import { Mal } from "node-myanimelist";
import { getMalClient } from "~/server/mal";

const OUTPUT = "scripts/mock_data.json";

const mock_file = "scripts/mock_users.json";

const data = JSON.parse(fs.readFileSync(mock_file).toString()) as string[];

const client = await getMalClient();

const animeLists: any = {};

console.log(`Create mock data for ${data.length} users...`);

for (let i = 0; i < data.length; i++) {
  const user = data[i];
  const list = await client.user
    .animelist(user, Mal.Anime.fields().mean().myListStatus(), null, {
      limit: 1000,
      status: "completed",
      sort: "list_score",
    })
    .call();

  animeLists[user] = list;

  cursorTo(process.stdout, 0);
  process.stdout.write(` > Progress ${((i / data.length) * 100).toFixed()}%`);
}

fs.writeFileSync(OUTPUT, JSON.stringify(animeLists));

console.log("\nCompleted!");
