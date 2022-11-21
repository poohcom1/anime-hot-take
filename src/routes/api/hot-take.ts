import { APIEvent, json } from "solid-start";
import URL from "url";
import axios from "axios";
import { Jikan4, Mal } from "node-myanimelist";
import { standardDeviation, mean as average } from "simple-statistics";
import { getMalClient } from "~/server/malClient";
import { getMongoClient } from "~/server/mongodb";
import { Err, Ok } from "~/types/monads";

// API

/**
 * Fetches the hot take data of the 'user' query parameter.
 * If no query parameter is given, a random user will be fetched (this is slow).
 * @param apiEvent
 * @returns
 */
export async function GET(apiEvent: APIEvent) {
  const query = URL.parse(apiEvent.request.url, true).query;

  const user = (query.user as string) ?? "poohcom1";

  const res = await fetchUserHotTake(user);

  if (res.ok) {
    return json(res.ok);
  } else {
    return new Response(null, { status: 500, statusText: res.err });
  }
}

// Functions

/**
 * Fetches the user hot take data, the mean data, and updates the database
 * @param username
 * @returns
 */
export async function fetchUserHotTake(
  username: string
): Promise<Result<HotTakeResult, string>> {
  try {
    const client = await getMalClient();

    const user: JikanUser = (
      (await Jikan4.jikanGet(
        `${Jikan4.jikanUrl}/users/${username}`
      )) as JikanUserResponse
    ).data;

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

    let lowest = { diff: Infinity, anime: filteredData[0] };
    let highest = { diff: 0, anime: filteredData[0] };

    let total = 0;

    for (const anime of filteredData) {
      const diff = Math.abs(anime.list_status.score - anime.node.mean!);

      if (diff < lowest.diff) {
        lowest.diff = diff;
        lowest.anime = anime;
      }

      if (diff > highest.diff) {
        highest.diff = diff;
        highest.anime = anime;
      }

      total += diff;
    }

    const score = total / filteredData.length;

    // Database

    const doc: DBUser = {
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
      .toArray()) as unknown as DBUser[];

    let scores = allData.map((s) => s.score);

    if (scores.length === 0) scores = [score];

    // Stats

    const mean = average(scores);

    const stdDev = standardDeviation(scores);

    // Response

    return Ok({
      userData: {
        user,
        score,
        topAnime: {
          title: highest.anime.node.title,
          image: highest.anime.node.main_picture?.medium ?? "",
          userScore: highest.anime.list_status.score,
          rating: highest.anime.node.mean ?? 5,
        },
      },
      stats: {
        mean,
        standardDeviation: stdDev,
      },
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

export async function randomUser() {
  const res = await fetch("https://api.jikan.moe/v4/random/users");

  const user = await res.json();

  return user as JikanUserResponse;
}
