// Third-party API

interface JikanUser {
  url: string;
  username: string;
  images: {
    jpg: {
      image_url: string;
    };
    webp: {
      image_url: string;
    };
  };
  last_online: string;
}

interface JikanUserResponse {
  data: JikanUser;
}

// Internal API

interface HotTakeUserData {
  user: JikanUser;
  rawData: AnimeSummaryWithScore[];
  score: number;
  rank: number;
  highest: AnimeSummary;
  lowest: AnimeSummary;
}

interface AnimeSummary {
  id: number;
  userScore: number;
  meanScore: number;
  image: string;
  title: string;
}

interface AnimeSummaryWithScore extends AnimeSummary {
  score: number;
  weightedScore: number;
}

interface HotTakeResult {
  userData: HotTakeUserData;
  stats: {
    min: number | null;
    max: number | null;
    mean: number | null;
    standardDeviation: number | null;
    count: number | null;
    positiveBias: number;
    negativeBias: number;
  };
}

interface VSAnime extends AnimeSummary {
  userScore2: number;
}

interface VsResult {
  anime: VSAnime[];
  user1: JikanUser;
  user2: JikanUser;
}

interface DBUser {
  _id: string;
  score: number;
}
