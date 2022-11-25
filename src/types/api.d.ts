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

interface AnimeSummary {
  id: number;
  userScore: number;
  meanScore: number;
  image: string;
  title: string;
}

interface AnimeSummaryWithScore extends AnimeSummary {
  score: number;
}

interface HotTakeResult {
  userData: {
    user: JikanUser;
    rawData: AnimeSummary[];
    score: number;
    rank: number;
    highest: AnimeSummary;
    lowest: AnimeSummary;
  };
  stats: {
    min: number | null;
    max: number | null;
    mean: number | null;
    standardDeviation: number | null;
    count: number | null;
  };
}

interface DBUser {
  _id: string;
  score: number;
}
