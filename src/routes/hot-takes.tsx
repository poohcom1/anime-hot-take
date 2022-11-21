import {
  createEffect,
  createSignal,
  Match,
  onMount,
  Show,
  Switch,
} from "solid-js";
import { Title } from "solid-start";
import { css } from "solid-styled";
import server$ from "solid-start/server";
import Button from "~/components/Button";
import { fetchUserHotTake } from "./api/hot-take";
import HotTakeDisplay from "~/components/HotTakeDisplay";
import LoadingImage from "~/assets/arima-ichika-ichika.gif";
import NotFoundImage from "~/assets/404_zetsubou_sayonara.jpg";

type HotTakeSignal = Result<HotTakeResult, string> | null;

export default function HotTakes() {
  const fetchData = server$(fetchUserHotTake);

  const [user, setUser] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [hotTake, setHotTake] = createSignal<HotTakeSignal>();

  let displayRef: HTMLDivElement | undefined;

  async function getHotTake() {
    setLoading(true);

    const res = await fetchData(user());

    setLoading(false);
    setHotTake(res);

    setTimeout(() => displayRef?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  css`
    @global {
      html {
        height: 100%;
        background-color: #181717;
      }
    }

    main {
      color: white;
      min-height: 100%;
      height: fit-content;
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

    input {
      background-color: transparent;
      padding-bottom: 4px;
      outline: 0;
      border: none;
      border-bottom: 1px solid grey;
      color: white;
      caret-color: white;
      font-size: larger;
      text-align: center;
      width: 320px;
    }

    input:focus {
      border-bottom-color: white;
      transition: border-bottom-color 0.2s;
    }

    .hot-take__results {
      margin: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `;

  let inputRef: HTMLInputElement | undefined;

  onMount(() => {
    inputRef?.focus();
  });

  return (
    <main>
      <Title>Hot Takes</Title>
      <h1>How hot are your anime takes?</h1>
      <br />
      <input
        ref={inputRef}
        id="usernameInput"
        type="text"
        placeholder="Enter your MAL username"
        value={user()}
        onKeyUp={async (e) => e.key === "Enter" && (await getHotTake())}
        onInput={(e) => setUser(e.currentTarget.value)}
      />
      <Button
        class="go-button"
        onClick={async () => await getHotTake()}
        disabled={!user().length || loading()}
      >
        Go
      </Button>
      <br />
      <div class="hot-take__results">
        <Switch>
          <Match when={loading()}>
            <img src={LoadingImage} />
          </Match>
          <Match when={!hotTake()}>{/* Initial */}</Match>
          <Match when={hotTake()} keyed>
            {(res) => (
              <Show
                when={res.ok}
                fallback={
                  <div>
                    <h3>{res.err}</h3>
                    <img src={NotFoundImage} height="300px" />
                  </div>
                }
                keyed
              >
                {(hotTake) => (
                  <HotTakeDisplay ref={displayRef} hotTake={hotTake} />
                )}
              </Show>
            )}
          </Match>
        </Switch>
      </div>
    </main>
  );
}
