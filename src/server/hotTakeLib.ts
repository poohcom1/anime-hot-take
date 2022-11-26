import axios from "axios";
import { Jikan4, Mal } from "node-myanimelist";
import {
  average,
  standardDeviation,
  quantileRank,
  min,
  max,
  median,
} from "simple-statistics";
import { Err, Ok } from "~/types/monads";
import { weightedAverage } from "~/utils/math";
import { getMalClient } from "./mal";
import { getMongoClient } from "./mongodb";

// Main calculations
const getDiff = (a: Anime) => Math.abs(getValueDiff(a));

export function calculateScore(animeList: Anime[]): CalculationResult {
  const sortedDiffData = animeList.sort(sortDiffs);

  const mappedData = sortedDiffData.map(formatUserAnimeWithScore);

  const sortedValueDiffData = sortedDiffData.sort(sortValueDiffs);

  return {
    score: weightedAverage(mappedData.map((s) => [s.score, s.userScore])),
    lowest: formatUserAnime(sortedValueDiffData[0]),
    highest: formatUserAnime(
      sortedValueDiffData[sortedValueDiffData.length - 1]
    ),
    rawData: sortedValueDiffData.map(formatUserAnimeWithScore),
  };
}

/**
 * Fetches the user hot take data, the mean data, and updates the database
 * @param usernameQuery
 * @returns
 */
export async function fetchAndCalculateHotTake(
  usernameQuery: string
): Promise<Result<HotTakeResult, string>> {
  try {
    const client = await getMalClient();

    const user: JikanUser = (
      (await Jikan4.jikanGet(
        `${Jikan4.jikanUrl}/users/${usernameQuery}`
      )) as JikanUserResponse
    ).data;

    const list = await client.user
      .animelist(
        user.username,
        Mal.Anime.fields().mean().myListStatus(),
        null,
        {
          limit: 1000,
          status: "completed",
          sort: "list_score",
        }
      )
      .call();

    const data = list.data.filter((a) => a.list_status.score > 0);

    const scoreResult = calculateScore(data);

    // Database

    if (isNaN(scoreResult.score)) {
      return Err("Something went wrong with maths :(");
    }

    const doc: DBUser = {
      _id: user.username,
      score: scoreResult.score,
    };

    const mongo = getMongoClient();
    const collection = mongo.db().collection(SCORES_COLLECTION);

    await collection.updateOne(
      { _id: user.username },
      { $set: doc },
      { upsert: true }
    );

    const allData = (await collection
      .find({})
      .toArray()) as unknown as DBUser[];

    let allScores = allData.map((s) => s.score).filter((s) => !!s && !isNaN(s));

    if (allScores.length === 0) allScores = [scoreResult.score];

    // Stats

    const mean = median(allScores);

    const stdDev = standardDeviation(allScores);

    // Response

    return Ok(<HotTakeResult>{
      userData: {
        ...scoreResult,
        user,
        rank: quantileRank(allScores, scoreResult.score),
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

// Misc
export const SCORES_COLLECTION = "scores";

type Anime = Mal.User.AnimeListItem<
  Mal.Common.WorkBase &
    Mal.Common.WorkForList.Mean & {
      my_list_status: Mal.Anime.AnimeListStatusBase;
    },
  Mal.Anime.AnimeListStatusBase
>;

const getValueDiff = (a: Anime) => a.list_status.score - (a.node.mean ?? 5);

export const sortDiffs = (a: Anime, b: Anime): number =>
  getDiff(b) - getDiff(a);

const sortValueDiffs = (a: Anime, b: Anime): number =>
  getValueDiff(b) - getValueDiff(a);

interface CalculationResult {
  score: number;
  highest: AnimeSummary;
  lowest: AnimeSummary;
  rawData: AnimeSummaryWithScore[];
}

const formatUserAnime = (anime: Anime): AnimeSummary => ({
  title: anime.node.title,
  image: anime.node.main_picture?.medium ?? "",
  userScore: anime.list_status.score,
  meanScore: anime.node.mean ?? 5,
  id: anime.node.id,
});

const formatUserAnimeWithScore = (anime: Anime): AnimeSummaryWithScore => ({
  score: getDiff(anime),
  weightedScore: getDiff(anime) * anime.list_status.score,
  ...formatUserAnime(anime),
});
