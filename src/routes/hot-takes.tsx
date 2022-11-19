import { createSignal, Match, Show, Switch } from "solid-js";
import { Title } from "solid-start";
import { css } from "solid-styled";
import { Ok, Err } from "~/types/monads";
import Button from "~/components/Button";
import LoadingImage from "../assets/arima-ichika-ichika.gif";
// Server side
import server$ from "solid-start/server";

export default function HotTakes() {
  const getUserRPC = server$(calculateMeanDifference);

  const [loading, setLoading] = createSignal(false);

  const [user, setUser] = createSignal("");
  const [hotTake, setHotTake] = createSignal<Result<
    HotTakeResult,
    string
  > | null>(null);

  const getHotTake = async () => {
    setHotTake(null);
    setLoading(true);

    const res = await getUserRPC(user());
    setHotTake(res);

    setLoading(false);
  };

  css`
    main {
      color: white;
      background-color: #181717;
      height: 100%;
      font-size: large;
    }

    h1 {
      display: inline-block;
      color: #da1b9b;
    }

    button,
    input,
    label {
      display: block;
      margin: 16px auto;
    }

    .results {
      margin: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `;

  return (
    <main>
      <Title>Hot Takes</Title>
      <h1>How hot are your takes?</h1>
      <br />
      <label for="usernameInput">Enter your username</label>
      <input
        id="usernameInput"
        type="text"
        value={user()}
        onKeyUp={async (e) => e.key === "Enter" && (await getHotTake())}
        onInput={(e) => setUser(e.currentTarget.value)}
      />
      <Button
        class="go-button"
        onClick={async () => await getHotTake()}
        disabled={!user().length}
      >
        Go
      </Button>
      <br />
      <div class="results">
        <Switch>
          <Match when={loading()}>
            <img src={LoadingImage} />
          </Match>
          <Match when={!hotTake()}>{/* Initial */}</Match>
          <Match when={hotTake()} keyed>
            {(res) => (
              <Show when={res.ok} fallback={<div>{res.err}</div>} keyed>
                {(hotTake) => (
                  <div>
                    <h2>{hotTake.score.toFixed(1)}</h2>
                  </div>
                )}
              </Show>
            )}
          </Match>
        </Switch>
      </div>
    </main>
  );
}

// Server-side functions

interface HotTakeResult {
  score: number;

  mean: number;
}

async function calculateMeanDifference(
  username: string
): Promise<Result<HotTakeResult, string>> {
  return Ok({
    score: 1,
    mean: 1.5,
  });
}

interface AxiosError {
  response?: {
    status: number;
  };
  message: string;
}

function isAxiosError(e: any): e is AxiosError {
  if ("response" in e && "status" in e.response) {
    return true;
  }

  if ("message" in e && typeof e.message === "string") {
    return true;
  }

  return false;
}
