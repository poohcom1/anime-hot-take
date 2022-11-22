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

interface HotTakeAnime {
  title: string;
  image: string;
  userScore: number;
  rating: number;
}

interface AnimeScore {
  userScore: number;
  meanScore: number;
  title: string;
}

interface HotTakeResult {
  userData: {
    user: JikanUser;
    rawData: AnimeScore[];
    score: number;
    rank: number;
    topAnime: HotTakeAnime;
  };
  stats: {
    min: number;
    max: number;
    mean: number;
    standardDeviation: number;
  };
}

interface DBUser {
  _id: string;
  score: number;
}
