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
const getDiff = (a: MalAnime) => Math.abs(getValueDiff(a));

export function calculateScore(animeList: MalAnime[]): CalculationResult {
  const sortedDiffData = animeList.sort(sortDiffs);

  const mappedData = sortedDiffData.map(formatUserAnimeWithScore);

  const sortedBySignedDiff = sortedDiffData.sort(sortValueDiffs);

  return {
    score: weightedAverage(mappedData.map((s) => [s.score, s.weightedScore])),
    lowest: formatUserAnime(sortedBySignedDiff[0]),
    highest: formatUserAnime(sortedBySignedDiff[sortedBySignedDiff.length - 1]),
    rawData: sortedBySignedDiff.map(formatUserAnimeWithScore),
  };
}

// API
const ANIMELIST_OPTIONS = {
  limit: 1000,
  status: "completed",
  sort: "list_score",
};

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
        ANIMELIST_OPTIONS
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

export async function fetchAndCompareUsers(
  username1: string,
  username2: string
): Promise<Result<VsResult, string>> {
  interface AnimeDiff {
    anime: MalAnime;
    userScore1: number;
    userScore2: number;
  }

  try {
    const client = await getMalClient();

    const userQuery1 = Jikan4.jikanGet(`${Jikan4.jikanUrl}/users/${username1}`);
    const userQuery2 = Jikan4.jikanGet(`${Jikan4.jikanUrl}/users/${username2}`);

    const res = await Promise.all([userQuery1, userQuery2]);

    const [userRes1, userRes2] = res as unknown as [
      JikanUserResponse,
      JikanUserResponse
    ];

    const animeQuery1 = client.user
      .animelist(
        userRes1.data.username,
        Mal.Anime.fields().mean().myListStatus(),
        null,
        ANIMELIST_OPTIONS
      )
      .call();

    const animeQuery2 = client.user
      .animelist(
        userRes2.data.username,
        Mal.Anime.fields().mean().myListStatus(),
        null,
        ANIMELIST_OPTIONS
      )
      .call();

    const [animelist1, animelist2] = await Promise.all([
      animeQuery1,
      animeQuery2,
    ]);

    const commonAnime: AnimeDiff[] = [];

    const list1 = animelist1.data.filter((a) => a.list_status.score > 0);
    const list2 = animelist2.data.filter((a) => a.list_status.score > 0);

    for (const anime of list1) {
      const match = list2.find((a) => anime.node.id === a.node.id);

      if (match) {
        commonAnime.push({
          anime,
          userScore1: anime.list_status.score,
          userScore2: match.list_status.score,
        });
      }
    }

    commonAnime.sort((a, b) => b.userScore1 - a.userScore1);

    commonAnime.sort(
      (a, b) =>
        Math.abs(b.userScore1 - b.userScore2) -
        Math.abs(a.userScore1 - a.userScore2)
    );

    return Ok({
      anime: commonAnime.map(
        (a) =>
          <VSAnime>{
            ...formatUserAnime(a.anime),
            userScore2: a.userScore2,
          }
      ),
      user1: userRes1.data,
      user2: userRes2.data,
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

type MalAnime = Mal.User.AnimeListItem<
  Mal.Common.WorkBase &
    Mal.Common.WorkForList.Mean & {
      my_list_status: Mal.Anime.AnimeListStatusBase;
    },
  Mal.Anime.AnimeListStatusBase
>;

const getValueDiff = (a: MalAnime) => a.list_status.score - (a.node.mean ?? 5);

export const sortDiffs = (a: MalAnime, b: MalAnime): number =>
  getDiff(b) - getDiff(a);

const sortValueDiffs = (a: MalAnime, b: MalAnime): number =>
  getValueDiff(b) - getValueDiff(a);

interface CalculationResult {
  score: number;
  highest: AnimeSummary;
  lowest: AnimeSummary;
  rawData: AnimeSummaryWithScore[];
}

const formatUserAnime = (anime: MalAnime): AnimeSummary => ({
  title: anime.node.title,
  image: anime.node.main_picture?.medium ?? "",
  userScore: anime.list_status.score,
  meanScore: anime.node.mean ?? 5,
  id: anime.node.id,
});

const formatUserAnimeWithScore = (anime: MalAnime): AnimeSummaryWithScore => ({
  score: getDiff(anime),
  weightedScore:
    getDiff(anime) * (anime.list_status.score - (anime.node.mean ?? 5) + 10),
  ...formatUserAnime(anime),
});
