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
import HotTakeDisplay from "~/components/HotTakeDisplay";
import ThinkingImage from "~/assets/thinking.png";
import LoadingImage from "~/assets/arima-ichika-ichika.gif";
import NotFoundImage from "~/assets/404_zetsubou_sayonara.jpg";
import {
  fetchAndCalculateHotTake,
  fetchAndCompareUsers,
} from "~/server/calculations";
import Delay from "~/components/Delay";
import { Err } from "~/types/monads";
import VSDisplay from "~/components/VSDisplay";

type HotTakeSignal = Result<HotTakeResult, string>;
type VsHotTakeSignal = Result<VsResult, string>;

const fetchHotTake = server$(fetchAndCalculateHotTake);
const fetchVs = server$(fetchAndCompareUsers);

export default function HotTakes() {
  const [mode, setMode] = createSignal<"Rank" | "VS">("Rank");

  const [user, setUser] = createSignal("");
  const [user2, setUser2] = createSignal("");
  const [init, setInit] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  const [hotTake, setHotTake] = createSignal<HotTakeSignal>(Err("_init_"));
  const [vsHotTake, setVsHotTake] = createSignal<VsHotTakeSignal>(
    Err("_init_")
  );

  let inputRef: HTMLInputElement | undefined;
  let inputRef2: HTMLInputElement | undefined;
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

    if (mode() === "Rank") {
      const res = await fetchHotTake(user());

      setHotTake(res);
    } else {
      const res = await fetchVs(user(), user2());

      setVsHotTake(res);
    }

    setInit(true);
    setLoading(false);

    setTimeout(
      () =>
        displayRef?.scrollIntoView({
          behavior: "smooth",
        }),
      200
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
      margin: 16px 16px;
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
      margin-top: 4px;
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
        <img
          src={ThinkingImage}
          height="70px"
          width="70px"
          style={{ "margin-left": "16px" }}
        />
      </h1>

      <br />
      <div>
        <Switch>
          {/* Rank Input */}
          <Match when={mode() === "Rank"}>
            <Delay>
              <div style={{ display: "flex", "justify-content": "center" }}>
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
              </div>
            </Delay>
          </Match>
          {/* VS Input */}
          <Match when={mode() === "VS"}>
            <Delay>
              <div style={{ display: "flex", "justify-content": "center" }}>
                <input
                  ref={inputRef}
                  style={{ width: "200px" }}
                  disabled={loading()}
                  type="text"
                  placeholder="User #1"
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
                <h4 style={{ margin: "8px" }}>vs</h4>
                <input
                  ref={inputRef2}
                  disabled={loading()}
                  style={{ width: "200px" }}
                  type="text"
                  placeholder="User #2"
                  value={user2()}
                  onKeyUp={async (e) => {
                    if (e.key === " ") e.stopImmediatePropagation();
                    if (e.key === "Enter") await getHotTake();
                  }}
                  onInput={(e) => {
                    const value = e.currentTarget.value;
                    if (!value.includes(" "))
                      setUser2(e.currentTarget.value.replaceAll(" ", ""));
                    else return (e.currentTarget.value = user2());
                  }}
                  onFocus={() => inputRef2?.select()}
                />
              </div>
            </Delay>
          </Match>
        </Switch>
      </div>
      {/* Mode Button */}
      <div>
        <Button
          width="112px"
          disabled={loading()}
          color={mode() === "Rank" ? "#2062b9" : "#de4a4a"}
          onClick={() => {
            setMode(mode() === "Rank" ? "VS" : "Rank");
            inputRef?.focus();
          }}
        >
          Mode: {mode()}
        </Button>
      </div>
      {/* Go Button */}
      <Button
        onClick={async () => await getHotTake()}
        disabled={
          (mode() === "Rank"
            ? !user().length
            : !user().length || !user2().length || user() === user2()) ||
          loading()
        }
      >
        <h3 style={{ margin: "4px" }}>Go</h3>
      </Button>
      <br />
      <img ref={loadingRef} class="loading" src={LoadingImage} />
      <div class="results">
        <Switch>
          <Match
            when={
              (mode() === "Rank" && hotTake()?.err === "_init_") ||
              (mode() === "VS" && vsHotTake()?.err === "_init_")
            }
          >
            {/* Initial */}
          </Match>
          <Match when={!loading()}>
            <Switch>
              <Match when={mode() === "Rank"}>
                <Show
                  when={hotTake().ok}
                  fallback={
                    <div>
                      <h3>{hotTake().err}</h3>
                      <img src={NotFoundImage} height="300px" />
                    </div>
                  }
                  keyed
                >
                  {(hotTake) => (
                    <HotTakeDisplay ref={displayRef} hotTake={hotTake} />
                  )}
                </Show>
              </Match>
              <Match when={mode() === "VS"}>
                <Show
                  when={vsHotTake().ok}
                  fallback={
                    <div>
                      <h3>{vsHotTake().err}</h3>
                      <img src={NotFoundImage} height="300px" />
                    </div>
                  }
                  keyed
                >
                  {(vsData) => <VSDisplay ref={displayRef} data={vsData} />}
                </Show>
              </Match>
            </Switch>
          </Match>
        </Switch>
      </div>
    </main>
  );
}
