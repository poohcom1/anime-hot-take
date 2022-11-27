import {
  createEffect,
  createResource,
  createSignal,
  Match,
  Show,
  Switch,
} from "solid-js";
import server$ from "solid-start/server";
import { fetchAndCalculateHotTake } from "~/server/calculations";
import { randomUser } from "../api/hot-take";

export default function Index() {
  const [state, setState] = createSignal<"none" | "user" | "take">("none");

  const fetchRandomUser = server$(async () => await randomUser());

  const fetchScore = server$(
    async (user: string) => await fetchAndCalculateHotTake(user)
  );

  const [score, setScore] = createSignal<Result<
    HotTakeResult,
    string
  > | null>();

  return (
    <main>
      <h1>Random Generator</h1>
      <button
        onClick={async () => {
          setState("user");
          const user = await fetchRandomUser();
          setState("take");
          const score = await fetchScore(user.data.username);
          setState("none");
          setScore(score);
        }}
      >
        Get random
      </button>
      <br />
      <Switch>
        <Match when={state() === "user"}>Loading user...</Match>
        <Match when={state() === "take"}>Loading data...</Match>
      </Switch>
      <Show when={score()} keyed>
        {(f) => (
          <Show when={f.ok} keyed fallback={<div>{f.err}</div>}>
            {(r) => (
              <div>
                <p>User: {r.userData.user.username}</p>
                <p>Score: {r.userData.score}</p>
                <p>Mean: {r.stats.mean}</p>
                <p>Standard Deviation: {r.stats.standardDeviation}</p>
              </div>
            )}
          </Show>
        )}
      </Show>
    </main>
  );
}
