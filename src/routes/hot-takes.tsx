import { createSignal, Show } from "solid-js";
import { Title } from "solid-start";
import server$ from "solid-start/server";
import { css } from "solid-styled";
import Button from "~/components/Button";
import LoadingImage from "../assets/anime-loading-gif-8.gif";
// Server side
import { calculateMeanDifference } from "~/server/scoreService";

export default function HotTakes() {
  const getUserRPC = server$(async (user: string) => {
    const data = await calculateMeanDifference(user);
    return {
      score: data,
    };
  });

  const [loading, setLoading] = createSignal(false);

  const [user, setUser] = createSignal("");
  const [hotTake, setHotTake] = createSignal<null | number>(null);

  const getHotTake = async () => {
    setHotTake(null);
    setLoading(true);
    setHotTake((await getUserRPC(user())).score);
    setLoading(false);
  };

  css`
    main {
      color: white;
      background-color: #181717;
      height: 100%;
    }

    h1 {
      display: inline-block;
      color: #da1b9b;
    }

    .loading-img {
      mix-blend-mode: multiply;
    }

    button,
    input,
    label {
      display: block;
      margin: 16px auto;
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
      <Button onClick={async () => await getHotTake()}>Go</Button>
      <br />
      <Show when={loading()}>
        <img src={LoadingImage} class="loading-img" />
      </Show>
      <Show when={hotTake() !== null}>
        <h2>{hotTake().toFixed(1)}</h2>
      </Show>
    </main>
  );
}
