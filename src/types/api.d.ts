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
  statsData: {
    mean: number;
  };
}

interface DBUser {
  _id: string;
  score: number;
}
