import { APIEvent, json } from "solid-start";
import URL from "url";
import { SCORES_COLLECTION } from "~/server/hotTakeLib";
import { getMongoClient } from "~/server/mongodb";

export interface StatsResponse {
  scores: number[];
}

export async function GET(apiEvent: APIEvent) {
  const query = URL.parse(apiEvent.request.url, true).query;

  let decimals = 1;

  if (query.decimals) {
    try {
      decimals = parseInt(`${query.decimals}`);
    } catch (e) {
      return new Response(null, {
        status: 400,
        statusText: "Failed to parse decimal. Must be integer",
      });
    }
  }

  decimals = Math.min(decimals, 50);

  const mongoClient = getMongoClient();

  const users = (await mongoClient
    .db()
    .collection(SCORES_COLLECTION)
    .find({})
    .toArray()) as unknown as DBUser[];

  if (process.env.NODE_ENV === "development") {
    return json(users);
  }

  const inverseDecimals = Math.pow(10, decimals);

  const scores = users.map(
    (u) => Math.round(u.score * inverseDecimals) / inverseDecimals
  );

  return json({ scores });
}
