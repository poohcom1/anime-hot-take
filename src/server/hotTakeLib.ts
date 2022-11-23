import axios from "axios";
import { Jikan4, Mal } from "node-myanimelist";
import { anime } from "node-myanimelist/typings/methods/jikan4";
import {
  sum,
  average,
  standardDeviation,
  quantileRank,
  min,
  max,
} from "simple-statistics";
import { Err, Ok } from "~/types/monads";
import { getMalClient } from "./mal";
import { getMongoClient } from "./mongodb";

export const SCORES_COLLECTION = "scores";

type Anime = Mal.User.AnimeListItem<
  Mal.Common.WorkBase &
    Mal.Common.WorkForList.Mean & {
      my_list_status: Mal.Anime.AnimeListStatusBase;
    },
  Mal.Anime.AnimeListStatusBase
>;

const getValueDiff = (a: Anime) => a.list_status.score - (a.node.mean ?? 5);

const getDiff = (a: Anime) => Math.abs(getValueDiff(a));

const sortDiffs = (a: Anime, b: Anime): number => getDiff(b) - getDiff(a);

const sortValueDiffs = (a: Anime, b: Anime): number =>
  getValueDiff(b) - getValueDiff(a);

const getTopBiasedDiff =
  (mult: number = 2) =>
  (a: Anime) =>
    Math.pow(getDiff(a), a.list_status.score === 10 ? mult : 1);

/**
 * Fetches the user hot take data, the mean data, and updates the database
 * @param username
 * @returns
 */
export async function fetchAndCalculateHotTake(
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
        limit: 1000,
        status: "completed",
        sort: "list_score",
      })
      .call();

    const data = list.data.filter((a) => a.list_status.score > 0);
    const sortedDiffData = data.sort(sortDiffs);

    if (sortedDiffData.length === 0) {
      return Err("Not enough data from list 🤔, are there any actual ratings?");
    }

    // Final score
    const score =
      sum(sortedDiffData.map(getTopBiasedDiff())) / sortedDiffData.length;

    const sortedValueDiffData = sortedDiffData.sort(sortValueDiffs);
    const lowest = sortedValueDiffData[0];
    const highest = sortedValueDiffData[sortedValueDiffData.length - 1];

    // Database

    if (isNaN(score)) {
      return Err("Something went wrong with maths :(");
    }

    const doc: DBUser = {
      _id: username,
      score,
    };

    const mongo = getMongoClient();
    const collection = mongo.db().collection(SCORES_COLLECTION);

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

    return Ok(<HotTakeResult>{
      userData: {
        user,
        rawData: sortedValueDiffData.map(formatUserAnime),
        rank: quantileRank(allScores, score),
        score,
        highest: formatUserAnime(highest),
        lowest: formatUserAnime(lowest),
      },
      stats: {
        min: min(allScores),
        max: max(allScores),
        mean,
        standardDeviation: stdDev,
        count: allScores.length,
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

const formatUserAnime = (anime: Anime): AnimeSummary => ({
  title: anime.node.title,
  image: anime.node.main_picture?.medium ?? "",
  userScore: anime.list_status.score,
  meanScore: anime.node.mean ?? 5,
});
