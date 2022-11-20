import { APIEvent, json, ResponseError } from "solid-start";
import URL from "url";
import axios from "axios";
import { Jikan4, Mal } from "node-myanimelist";
import { getMalClient } from "~/server/malClient";
import { getMongoClient } from "~/server/mongodb";
import { Err, Ok } from "~/types/monads";

// API

/**
 * Fetches the hot take data of the 'user' query parameter.
 * @param apiEvent
 * @returns
 */
export async function GET(apiEvent: APIEvent) {
  const query = URL.parse(apiEvent.request.url, true).query;

  const user = (query.user as string) ?? (await randomUser()).data.username;
  if (query.user) {
    const res = await fetchUserHotTake(user);

    if (res.ok) {
      return json(res.ok);
    } else {
      return new Response(null, { status: 500, statusText: res.err });
    }
  } else {
    return new Response(null, { status: 400, statusText: "No user provided" });
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

    const user: JikanUser = (<{ data: JikanUser }>(
      await Jikan4.jikanGet(`${Jikan4.jikanUrl}/users/${username}`)
    )).data;

    const list = await client.user
      .animelist(username, Mal.Anime.fields().mean().myListStatus(), null, {
        limit: 50,
        status: "completed",
        sort: "list_score",
      })
      .call();

    const anime = list.data;
    // anime.sort((a, b) => -a.list_status.score + b.list_status.score);
    let topAnime = anime.filter((anime) => anime.list_status.score >= 10);

    if (topAnime.length === 0) {
      topAnime = anime.slice(0, 10);
    }

    if (anime.length === 0) {
      return Err("bruh you don't have any anime");
    }

    let lowest = { diff: Infinity, anime: anime[0].node };
    let highest = { diff: 0, anime: anime[0].node };

    let total = 0;

    for (let i = 0; i < topAnime.length; i++) {
      const cur = topAnime[i];
      const diff = Math.abs(cur.list_status.score - (cur.node.mean ?? 5));

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

    const score =
      topAnime.reduce(
        (acc, cur) =>
          acc + Math.abs(cur.list_status.score - (cur.node.mean ?? 5)),
        0
      ) / topAnime.length;

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

    const mean =
      allData.length > 0
        ? allData.reduce((pre, cur) => pre + cur.score, 0) / allData.length
        : score;

    // Response

    return Ok({
      userData: {
        user,
        score,
        topAnime: {
          title: highest.anime.title,
          image: highest.anime.main_picture?.medium ?? "",
          userScore: highest.anime.my_list_status.score,
          rating: highest.anime.mean ?? 5,
        },
      },
      statsData: {
        mean,
      },
    });
  } catch (e) {
    if (axios.isAxiosError(e)) {
      if (e.response) {
        switch (e.response.status) {
          case 404:
            return Err("Cannot find user u dum dum");
          case 408:
            return Err("idk server timed out");
          default:
            return Err(e.message);
        }
      }
    }
    console.error(e);
    return Err("Unknown error");
  }
}

async function randomUser() {
  const res = await fetch("https://api.jikan.moe/v4/random/users");

  const user = await res.json();

  return user;
}
