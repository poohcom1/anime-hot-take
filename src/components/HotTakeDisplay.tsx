import { css } from "solid-styled";
import { clamp, inverseLerp } from "~/utils/math";
import Delay from "./Delay";
import HotTakeBar from "./HotTakeBar";

interface Rank {
  name: string;
  description: string;
  color: string;
}

const DEVIATIONS = 5;

const RANKS: Rank[] = [
  {
    name: "Boring",
    description: "You like FMA: Brotherhood, don't you?",
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
  const score = props.hotTake.userData.score;
  const mean = props.hotTake.stats.mean;
  const stdDev = props.hotTake.stats.standardDeviation;

  const start = mean - (stdDev * DEVIATIONS) / 2;
  const end = mean + (stdDev * DEVIATIONS) / 2;

  const percent = inverseLerp(score, start, end);

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
    }

    .flex {
      display: flex;
    }

    .user-img {
      margin-left: auto;
      justify-self: end;
    }
  `;

  return (
    <div id={props.id} ref={props.ref}>
      <div class="container">
        <div>
          <div class="flex">
            <div>
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
            <p style="color: grey; margin: 4px 0">Hot meter:</p>
            <HotTakeBar percent={percent} width={1000} />
          </Delay>
        </div>
        <div class="separator" />
        <div style="margin-left: 64px">
          <Delay delayMs={1000}>
            <div>
              <h2>Hottest take:</h2>
              <img src={props.hotTake.userData.topAnime.image} height="400px" />
              <div class="hottest-anime">
                <div>
                  <h3>Average score</h3>
                  <h4>{props.hotTake.userData.topAnime.rating}</h4>
                </div>
                <div>
                  <h3>{props.hotTake.userData.user.username}'s Score</h3>
                  <h4>{props.hotTake.userData.topAnime.userScore}</h4>
                </div>
              </div>
            </div>
          </Delay>
        </div>
      </div>
    </div>
  );
}
