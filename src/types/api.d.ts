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

interface HotTakeResult {
  user: JikanUser;
  score: number;

  mean: number;
}
