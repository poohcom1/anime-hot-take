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

export async function getUserAnimelist(user: string) {
  const client = await getMalClient();
  const list = client.user
    .animelist(user, Mal.Anime.fields().mean().myListStatus(), null, {
      limit: 1000,
      status: "completed",
      sort: "list_score",
    })
    .call();

  return list;
}
