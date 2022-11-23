import { createSignal, For } from "solid-js";
import { css } from "solid-styled";
import { Collapse } from "solid-collapse";
import { FaSolidCircleInfo as InfoCircle } from "solid-icons/fa";
import { clamp, inverseLerp } from "~/utils/math";
import Delay from "./Delay";
import GradientProgress from "./GradientProgress";

import style from "./HotTakeDisplay.module.css";

interface Rank {
  name: string;
  description: string;
  color: string;
}

const DEVIATIONS = 5;

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
    name: "Normie",
    description: "Gets their tastes from reddit",
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

export default function HotTakeDisplay(props: HotTakeDisplayProps) {
  const score = props.hotTake.userData.score ?? 0;
  const mean = props.hotTake.stats.mean ?? 0;
  const stdDev = props.hotTake.stats.standardDeviation ?? 0;

  const start = mean - (stdDev * DEVIATIONS) / 2;
  const end = mean + (stdDev * DEVIATIONS) / 2;

  const percent = inverseLerp(score, start, end);

  // Animation
  const [showInfo, setShowInfo] = createSignal(false);
  const toggleInfo = () => {
    const show = showInfo();
    setShowInfo(!showInfo());
    if (!show) {
      setTimeout(
        () =>
          document
            .querySelector(".info-text")
            ?.scrollIntoView({ behavior: "smooth" }),
        300
      );
    }
  };

  const rank =
    RANKS[
    clamp(
      Math.floor((score - mean) / stdDev + DEVIATIONS / 2),
      0,
      RANKS.length - 1
    )
    ];

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

    .hottest-anime {
      display: flex;
      justify-content: center;
    }

    .hottest-anime > div {
      margin: 16px;
    }

    .container {
      display: flex;
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

    .center-text {
      text-align: center;
    }

    .info-section {
      margin: 16px 0;
      margin-left: 0;
      color: gray;
      overflow: hidden;
      border-radius: 8px;
      background-color: ${showInfo() ? "#ffffff0a" : "transparent"};
    }

    .info-section-toggle {
      padding: 16px;
      display: flex;
      justify-content: start;
      align-items: center;
      transition: background-color 0.2s;
    }

    .info-section-toggle:hover {
      background-color: #ffffff22;
    }

    .info-text {
      padding: 8px;
      text-align: left;
    }

    .info-text > div {
      margin: 4px;
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
    }
  `;

  console.table(props.hotTake.userData.rawData);

  return (
    <div id={props.id} ref={props.ref}>
      <div class="container">
        <div>
          {/* Rank and Bar */}
          <div class="flex rank-section">
            <div class="user-info">
              <Delay delayMs={200}>
                <h3>{props.hotTake.userData.user.username}'s rank:</h3>
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
            <p style={{ color: "grey", margin: "4px 0" }}>Hot meter:</p>
            <GradientProgress percent={percent} width={1000} />
          </Delay>
        </div>
        <div class="separator" />
        {/* Hottest Anime */}
        <div>
          <Delay delayMs={1000}>
            <div>
              <h2>Hottest take:</h2>
              <h4>{props.hotTake.userData.topAnime.title}</h4>
              <img src={props.hotTake.userData.topAnime.image} height="300px" />
              <div class="hottest-anime">
                <div>
                  <h3 class="center-text">Average score</h3>
                  <h4>{props.hotTake.userData.topAnime.rating}</h4>
                </div>
                <div>
                  <h3 class="center-text">
                    {props.hotTake.userData.user.username}'s Score
                  </h3>
                  <h4>{props.hotTake.userData.topAnime.userScore}</h4>
                </div>
              </div>
            </div>
          </Delay>
        </div>
      </div>
      {/* Info */}
      <div class="info-section">
        <div class="info-section-toggle" onClick={toggleInfo}>
          <InfoCircle style={{ "margin-left": "0px" }} />
          <span style={{ "margin-left": "8px", "user-select": "none" }}>
            More Info
          </span>
        </div>
        <div class="info-text">
          <Collapse value={showInfo()} class={style.infoCollapse}>
            <div>
              Ranking is calculated by getting the average difference between
              your top anime scores and the said anime's mean rating.
            </div>
            <br />
            <For
              each={[
                ["User Raw Score", props.hotTake.userData.score.toFixed(2)],
                [
                  "User Percentile",
                  (props.hotTake.userData.rank * 100).toFixed(0) + "%",
                ],
                ["Data points", props.hotTake.userData.rawData.length],
                [],
                ["Mean Score", props.hotTake.stats.mean?.toFixed(2)],
                ["Min Score", props.hotTake.stats.min?.toFixed(2)],
                ["Max Score", props.hotTake.stats.max?.toFixed(2)],
                [
                  "Standard Deviation",
                  props.hotTake.stats.standardDeviation?.toFixed(2),
                ],[
                  "N",
                  props.hotTake.stats.count ?? 0,
                ],
              ]}
            >
              {([label, text]) => (
                <div>
                  {label}
                  {label ? ":" : <br />} <strong>{text}</strong>
                </div>
              )}
            </For>
          </Collapse>
        </div>
      </div>
    </div>
  );
}
