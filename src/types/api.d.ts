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

interface HotTakeResult {
  userData: {
    user: JikanUser;
    score: number;
    topAnime: HotTakeAnime;
  };
  stats: {
    mean: number;
    standardDeviation: number;
  };
}

interface DBUser {
  _id: string;
  score: number;
}
