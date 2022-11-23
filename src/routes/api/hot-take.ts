import { APIEvent, json } from "solid-start";
import URL from "url";
import axios from "axios";
import { Jikan4, Mal } from "node-myanimelist";
import {
  standardDeviation,
  mean as average,
  sum,
  min,
  max,
  quantileRank,
} from "simple-statistics";
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

function averageDiff(
  anime: {
    node: { mean: number | null };
    list_status: { score: number };
  }[]
) {
  if (anime.length === 0) {
    return 0;
  }
  return (
    anime.reduce(
      (pre, cur) =>
        Math.abs(cur.list_status.score - (cur.node.mean ?? 5)) + pre,
      0
    ) / anime.length
  );
}

/**
 * Fetches the user hot take data, the mean data, and updates the database
 * @param username
 * @returns
 */
export async function fetchUserHotTake(
  username: string,
  minCount = 9
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

    if (list.data.length === 0) {
      return Err("Not enough data from list 🤔, are there any actual ratings?");
    }

    const filteredData = list.data.filter((a) => a.list_status.score === 10);

    // Calculate
    let highest = { diff: 0, anime: filteredData[0] };

    const diffs: number[] = [];

    for (const anime of filteredData) {
      const diff = Math.abs(anime.list_status.score - anime.node.mean!);

      if (diff > highest.diff) {
        highest.diff = diff;
        highest.anime = anime;
      }

      diffs.push(diff);
    }

    // Score sweeping
    let count = filteredData.length;
    let scoreBase = 9;

    while (count < minCount && scoreBase >= 0) {
      const animeData = list.data.filter(
        (a) => a.list_status.score === scoreBase
      );

      const avg = averageDiff(animeData);
      filteredData.push(...animeData);

      diffs.push(avg);
      count++;
    }

    // Final score
    const score = sum(diffs) / count;

    // Database

    if (isNaN(score)) {
      return Err("Something went wrong with maths :(");
    }

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

    let allScores = allData.map((s) => s.score).filter((s) => !!s && !isNaN(s));

    if (allScores.length === 0) allScores = [score];

    // Stats

    const mean = average(allScores);

    const stdDev = standardDeviation(allScores);

    // Response

    return Ok({
      userData: {
        user,
        rawData: filteredData.map(
          (a): AnimeScore => ({
            userScore: a.list_status.score,
            meanScore: a.node.mean ?? 5,
            title: a.node.title,
          })
        ),
        rank: quantileRank(allScores, score),
        score,
        topAnime: {
          title: highest.anime.node.title,
          image: highest.anime.node.main_picture?.medium ?? "",
          userScore: highest.anime.list_status.score,
          rating: highest.anime.node.mean ?? 5,
        },
      },
      stats: {
        min: min(allScores),
        max: max(allScores),
        mean,
        standardDeviation: stdDev,
        count: allScores.length
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
