import { createMemo, createSignal, For, Match, Switch } from "solid-js";
import { css } from "solid-styled";
import { Collapse } from "solid-collapse";
import ease from "easy-ease";
import {
  FaSolidStar as StarIcon,
  FaSolidThumbsDown as DislikeIcon,
} from "solid-icons/fa";
import { clamp, inverseLerp } from "~/utils/math";
import Delay from "./Delay";
import GradientProgress from "./GradientProgress";

import {
  formatNumber,
  formatText,
  objectToArray,
  omit,
  takePingPong,
} from "~/utils/object";
import InfoPane from "./InfoPane";

interface Rank {
  name: string;
  description: string;
  color: string;
}

const RANKS: Rank[] = [
  {
    name: "Soulless",
    description: "Let me guess, you like FMA: Brotherhood",
    color: "#0000ff",
  },
  {
    name: "Anituber",
    description: "*Writes reviews to validate insecure tastes*",
    color: "#620cb7",
  },
  {
    name: "Redditor",
    description: "Thanks for the gold kind stran-",
    color: "#ffff39",
  },
  {
    name: "4channer",
    description: " > What does he mean by this?",
    color: "#ff4000",
  },
  {
    name: "Contrarian",
    description: "Holy fuck that's edgy",
    color: "#ff0000",
  },
];

interface HotTakeDisplayProps {
  id?: string;
  ref?: HTMLDivElement;
  hotTake: HotTakeResult;
}

const ANIM_TIME = 3;

export default function HotTakeDisplay(props: HotTakeDisplayProps) {
  const score = props.hotTake.userData.score ?? 0;
  const mean = props.hotTake.stats.mean ?? 0;
  const stdDev = props.hotTake.stats.standardDeviation ?? 0;

  const start = mean - (stdDev * RANKS.length) / 2;
  const end = mean + (stdDev * RANKS.length) / 2;

  const percent = inverseLerp(start, end, score);

  const rank =
    RANKS[
      clamp(
        Math.floor((score - mean) / stdDev + RANKS.length / 2),
        0,
        RANKS.length - 1
      )
    ];

  const [percentDisplay, setPercentDisplay] = createSignal(0);

  ease({
    durationMs: (ANIM_TIME + 2) * 1000,
    startValue: 0,
    endValue: percent,
    onStep: (val) => setPercentDisplay(val),
  });

  css`
    h1 {
      margin: 16px;
      color: ${rank.color};
    }

    h1,
    h2,
    h3,
    p {
      margin-left: 0;
      text-align: left;
    }

    .hottest-takes {
      display: flex;
      justify-content: center;
    }

    .hottest-anime {
      margin: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .hottest-anime__scores > div {
      margin: 8px 8px;
    }

    .anime-title {
      text-align: center;
      padding: 0 16px;
      max-width: 200px;
      height: 45px;
      max-height: 50px;
      overflow: hidden;
      text-overflow: clip;
    }

    .container {
      align-items: center;
      justify-content: center;
      margin: 32px;
      margin-top: 0;
    }

    .flex {
      display: flex;
    }

    .rank-section {
      min-width: 50vw;
    }

    .user-info {
      width: 100%;
    }

    .user-img {
      margin-left: auto;
      justify-self: end;
      flex-shrink: 5;
    }

    .separator {
      margin: 0 32px;
    }

    /* Table */
    th,
    td {
      padding: 4px;
    }
    tr:nth-child(odd) {
      background-color: #d6eeee22;
    }

    @media only screen and (max-width: 1000px) {
      .container {
        display: block;
        margin: 0;
      }

      .user-img {
        display: none;
      }

      .separator {
        margin: 0;
      }

      .hottest-takes {
        display: block;
      }
    }
  `;

  // Debug
  const rawData = [...props.hotTake.userData.rawData];

  rawData.sort((a, b) => b.score - a.score);

  const table = createMemo(() =>
    objectToArray(
      rawData.map((d) => omit(d, ["image", "id"])),
      formatText
    )
  );

  return (
    <div id={props.id} ref={props.ref}>
      <div class="container">
        <div>
          {/* Rank and Bar */}
          <div class="flex rank-section">
            <div class="user-info">
              <Delay delayMs={200}>
                <h3>
                  <a
                    href={`https://myanimelist.net/animelist/${props.hotTake.userData.user.username}?status=2&order=4&order2=0`}
                    target="_blank"
                  >
                    {props.hotTake.userData.user.username}
                  </a>
                  's rank:
                </h3>
              </Delay>
              <Delay delayMs={500}>
                <h1>{rank.name}</h1>
                <p>
                  <strong>{rank.description}</strong>
                </p>
              </Delay>
            </div>
            <div class="user-img">
              <Delay delayMs={200}>
                <img
                  src={props.hotTake.userData.user.images.webp.image_url}
                  height="200px"
                />
              </Delay>
            </div>
          </div>
          <Delay delayMs={200}>
            <p style={{ color: "grey", margin: "4px 0" }}>
              Hot meter: {(percentDisplay() * 100).toFixed(1) + "%"}
            </p>
            <GradientProgress
              percent={Math.min(1, percent)}
              width={1000}
              animTime={ANIM_TIME}
            />
          </Delay>
        </div>
        <div class="separator" />
        {/* Hottest Anime */}
        <div>
          <Delay delayMs={1000}>
            <div>
              <h2>Hottest takes:</h2>
              <div class="hottest-takes">
                <For each={takePingPong(props.hotTake.userData.rawData, 5)}>
                  {(anime, ind) => (
                    <div class="hottest-anime">
                      <h4 class="anime-title" title={anime.title}>
                        <span
                          style={{
                            "margin-right": "8px",
                            display: "inline-flex",
                            "align-items": "center",
                          }}
                        >
                          <Switch>
                            <Match when={ind() === 0}>
                              <StarIcon color="yellow" />
                            </Match>
                            <Match when={ind() === 1}>
                              <DislikeIcon color="maroon" />
                            </Match>
                          </Switch>
                        </span>
                        <a
                          href={`https://myanimelist.net/anime/${anime.id}`}
                          target="_blank"
                        >
                          {anime.title}
                        </a>
                      </h4>
                      <a
                        href={`https://myanimelist.net/anime/${anime.id}`}
                        target="_blank"
                      >
                        <img src={anime.image} height="200px" />
                      </a>
                      <div class="hottest-anime__scores">
                        <div>
                          User Score: <strong>{anime.userScore}/10</strong>
                        </div>
                        <div>
                          MAL Rating:{" "}
                          <strong>{anime.meanScore.toFixed(1)}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Delay>
        </div>
      </div>
      {/* Info */}
      <InfoPane>
        <div class="info-text">
          <p>
            Ranking score is calculated from the difference between your anime
            score and anime's average rating. Higher score are weighted higher,
            as hating on a popular show isn't as much of a hot take as loving a
            hated show.
          </p>
          <br />
          <For
            each={[
              ["User Raw Score", props.hotTake.userData.score?.toFixed(2)],
              [
                "User Percentile",
                ((props.hotTake.userData.rank ?? 0) * 100).toFixed(0) + "%",
              ],
              ["Data points", props.hotTake.userData.rawData.length],
              [],
              ["Mean Score", props.hotTake.stats.mean?.toFixed(2)],
              ["Min Score", props.hotTake.stats.min?.toFixed(2)],
              ["Max Score", props.hotTake.stats.max?.toFixed(2)],
              [
                "Standard Deviation",
                props.hotTake.stats.standardDeviation?.toFixed(2),
              ],
              ["N", props.hotTake.stats.count ?? 0],
            ]}
          >
            {([label, text]) => (
              <>
                {label}
                {label ? ":" : <br />} <strong>{text}</strong>
                <br />
              </>
            )}
          </For>
        </div>
        <div>
          <table style={{ margin: "auto" }}>
            <tbody>
              {table().map((row, index) => (
                <tr>
                  {row.map((v) =>
                    index === 0 ? <th>{v}</th> : <td>{formatNumber(v)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoPane>
    </div>
  );
}
