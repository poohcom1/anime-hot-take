import { Mal } from "node-myanimelist";
import { getMalClient } from "./malService";

export async function calculateMeanDifference(
  username: string
): Promise<number> {
  const client = await getMalClient();

  const list = await client.user
    .animelist(username, Mal.Anime.fields().mean().myListStatus(), null, {
      limit: 50,
      status: "completed",
      sort: "list_score",
    })
    .call();

  const filteredData = list.data.filter(
    (anime) => anime.list_status.score >= 10
  );

  return (
    filteredData.reduce(
      (pre, cur) => pre + Math.abs(cur.list_status.score - cur.node.mean!),
      0
    ) / filteredData.length
  );
}
