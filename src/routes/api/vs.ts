import { APIEvent, json } from "solid-start";
import URL from "url";
import { fetchAndCompareUsers } from "~/server/calculations";

export async function GET(apiEvent: APIEvent) {
  const query = URL.parse(apiEvent.request.url, true).query;

  const user1 = query.user1;
  const user2 = query.user2;

  if (!user1 || !user2) {
    return json({
      error: "You need both user1 and user2 params",
    });
  }

  return json(await fetchAndCompareUsers(user1 as string, user2 as string));
}
