import { Mal } from "node-myanimelist";

export type AnimeListItem = Mal.User.AnimeListItem<
  Mal.Common.WorkBase,
  Mal.Anime.AnimeListStatusBase
>;

export type AnimeList = Mal.Common.Paging<AnimeListItem>;

let accountCache: Mal.MalAcount | null = null;

export async function getMalClient(): Promise<Mal.MalAcount> {
  if (accountCache) {
    return accountCache;
  }

  const auth = Mal.auth(process.env.MAL_CLIENT_ID);
  const account = await auth.guestLogin();

  accountCache = account;

  return account;
}
