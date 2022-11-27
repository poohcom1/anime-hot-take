import { APIEvent, json } from "solid-start";
import URL from "url";
import { fetchAndCalculateHotTake } from "~/server/calculations";

// API

/**
 * Fetches the hot take data of the 'user' query parameter.
 * If no query parameter is given, a random user will be fetched (this is slow).
 * @param apiEvent
 * @returns
 */
export async function GET(apiEvent: APIEvent) {
  const query = URL.parse(apiEvent.request.url, true).query;

  const user = (query.user as string) ?? "poohcom1";

  const res = await fetchAndCalculateHotTake(user);

  if (res.ok) {
    return json(res.ok);
  } else {
    return new Response(null, { status: 500, statusText: res.err });
  }
}
export async function randomUser() {
  const res = await fetch("https://api.jikan.moe/v4/random/users");

  const user = await res.json();

  return user as JikanUserResponse;
}
