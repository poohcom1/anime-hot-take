import { createSignal, Match, onMount, Show, Switch } from "solid-js";
import { Title } from "solid-start";
import { css } from "solid-styled";
import server$ from "solid-start/server";
import Button from "~/components/Button";
import HotTakeDisplay from "~/components/HotTakeDisplay";
import ThinkingImage from "~/assets/thinking.png";
import LoadingImage from "~/assets/arima-ichika-ichika.gif";
import NotFoundImage from "~/assets/404_zetsubou_sayonara.jpg";
import { fetchAndCalculateHotTake } from "~/server/hotTakeLib";

type HotTakeSignal = Result<HotTakeResult, string> | null;

export default function HotTakes() {
  const fetchData = server$(fetchAndCalculateHotTake);

  const [user, setUser] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [hotTake, setHotTake] = createSignal<HotTakeSignal>();

  let inputRef: HTMLInputElement | undefined;
  let displayRef: HTMLDivElement | undefined;
  let loadingRef: HTMLImageElement | undefined;

  async function getHotTake() {
    inputRef?.blur();
    setLoading(true);

    setTimeout(
      () =>
        loadingRef?.scrollIntoView({
          behavior: "smooth",
        }),
      100
    );

    const res = await fetchData(user());

    setLoading(false);
    setHotTake(res);

    setTimeout(
      () =>
        displayRef?.scrollIntoView({
          behavior: "smooth",
        }),
      500
    );
  }

  onMount(() => {
    inputRef?.focus();
  });

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
      color: #f654c0;
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

    input:disabled {
      color: gray;
    }

    input:focus {
      border-bottom-color: white;
      transition: border-bottom-color 0.2s;
    }

    .results {
      margin: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .loading {
      opacity: ${loading() ? "100%" : "0%"};
      transition: opacity 0.2s;
      position: absolute;
      margin-top: 16px;
      margin-left: auto;
      margin-right: auto;
      left: 0;
      right: 0;
      z-index: -1;
    }

    @media only screen and (max-width: 768px) {
      h1 {
        margin: inherit 0;
      }

      h1 img {
        display: block;
        margin: auto;
      }

      .loading {
        width: 90%;
      }
    }
  `;

  return (
    <main>
      <Title>Hot Takes</Title>
      <h1>
        How hot are your anime takes?
        <img src={ThinkingImage} height="70px" />
      </h1>

      <br />
      <input
        ref={inputRef}
        disabled={loading()}
        id="usernameInput"
        type="text"
        placeholder="Enter a MAL username"
        value={user()}
        onKeyUp={async (e) => {
          if (e.key === " ") e.stopImmediatePropagation();
          if (e.key === "Enter") await getHotTake();
        }}
        onInput={(e) => {
          const value = e.currentTarget.value;
          if (!value.includes(" "))
            setUser(e.currentTarget.value.replaceAll(" ", ""));
          else return (e.currentTarget.value = user());
        }}
        onFocus={() => inputRef?.select()}
      />
      <Button
        class="go-button"
        onClick={async () => await getHotTake()}
        disabled={!user().length || loading()}
      >
        Go
      </Button>
      <br />
      <img ref={loadingRef} class="loading" src={LoadingImage} />
      <div class="results">
        <Switch>
          <Match when={!hotTake()}>{/* Initial */}</Match>
          <Match when={!loading() && hotTake()} keyed>
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
