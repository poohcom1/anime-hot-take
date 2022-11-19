import { APIEvent, json, ResponseError } from "solid-start";
import URL from "url";
import axios from "axios";
import { Jikan4, Mal } from "node-myanimelist";
import { getMalClient } from "~/server/malClient";
import { getMongoClient } from "~/server/mongodb";
import { Err, Ok } from "~/types/monads";

// API
export async function GET(apiEvent: APIEvent) {
  const query = URL.parse(apiEvent.request.url, true).query;

  let user = (query.user as string) ?? (await randomUser()).data.username;

  const res = await fetchUserHotTake(user);

  if (res.ok) {
    return json(res.ok);
  } else {
    return new Response(null, { status: 500, statusText: res.err });
  }
}

// Functions

export interface HotTakeResult {
  score: number;
  username: string;

  mean: number;
}

interface DBSchema {
  _id: string;
  score: number;
}

export async function fetchUserHotTake(
  username: string
): Promise<Result<HotTakeResult, string>> {
  try {
    const client = await getMalClient();

    const list = await client.user
      .animelist(username, Mal.Anime.fields().mean().myListStatus(), null, {
        limit: 50,
        status: "completed",
        sort: "list_score",
      })
      .call();

    const filteredData = list.data.filter(
      (anime) => anime.list_status.score >= 10
    );

    if (filteredData.length === 0) {
      return Err("You don't have any 10s 🤔, maybe you are too edgy");
    }

    let lowest = { diff: Infinity, anime: filteredData[0].node };
    let highest = { diff: 0, anime: filteredData[0].node };

    let total = 0;

    for (let i = 0; i < filteredData.length; i++) {
      const cur = filteredData[i];
      const diff = Math.abs(cur.list_status.score - cur.node.mean!);

      if (diff < lowest.diff) {
        lowest.diff = diff;
        lowest.anime = cur.node;
      }

      if (diff > highest.diff) {
        highest.diff = diff;
        highest.anime = cur.node;
      }

      total += diff;
    }

    const score = total / filteredData.length;

    // Database
    const doc: DBSchema = {
      _id: username,
      score,
    };

    const mongo = getMongoClient();
    const collection = mongo.db().collection("scores");
    await collection.updateOne(
      { _id: username },
      { $set: doc },
      { upsert: true }
    );

    const allData = (await collection
      .find({})
      .toArray()) as unknown as DBSchema[];

    const mean =
      allData.length > 0
        ? allData.reduce((pre, cur) => pre + cur.score, 0) / allData.length
        : score;

    // Response

    return Ok({
      username,
      score,
      mean,
    });
  } catch (e) {
    if (axios.isAxiosError(e)) {
      if (e.response?.status === 404) {
        return Err("Cannot find user u dum dum");
      }
      return Err(e.message);
    }
    console.error(e);
    return Err("Unknown error");
  }
}

interface UserResponse {
  data: {
    mal_id: number;
    username: string;
  };
}

async function randomUser() {
  const res = await fetch("https://api.jikan.moe/v4/random/users");

  const user = await res.json();

  return user;
}
