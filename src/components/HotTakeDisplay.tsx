import { css } from "solid-styled";
import { clamp, inverseLerp } from "~/utils/math";
import Delay from "./Delay";
import HotTakeBar from "./HotTakeBar";

interface Rank {
  name: string;
  description: string;
}

const DEVIATIONS = 3;

const RANKS: Rank[] = [
  {
    name: "Clout Chaser",
    description: "...do you only watch anime to make friends?",
  },
  { name: "Normie", description: "reeeeeeeeeeee" },
  {
    name: "Anituber",
    description: "*Read reviews to validate insecure tastes*",
  },
  { name: "Edge Lord", description: "occasionally browses 4chan" },
  { name: "Contrarian", description: "Too cool to like FMA: Brotherhood" },
  { name: "Legend", description: "Freed from the shackles of discourse" },
];

interface HotTakeDisplayProps {
  id?: string;
  ref?: HTMLDivElement;
  hotTake: HotTakeResult;
}

export default function HotTakeDisplay(props: HotTakeDisplayProps) {
  css`
    h1 {
      margin: 16px;
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

  const score = props.hotTake.userData.score;
  const mean = props.hotTake.stats.mean;
  const stdDev = props.hotTake.stats.standardDeviation;

  const start = mean - stdDev * DEVIATIONS;
  const end = mean + stdDev * DEVIATIONS;

  const percent = inverseLerp(score, start, end);

  const rank =
    RANKS[
      clamp(
        Math.floor((score - mean) / stdDev) + DEVIATIONS,
        0,
        RANKS.length - 1
      )
    ];

  return (
    <div id={props.id} ref={props.ref}>
      <div class="container">
        <div>
          <div class="flex">
            <div>
              <Delay delayMs={500}>
                <h3>{props.hotTake.userData.user.username}'s rank:</h3>
              </Delay>
              <Delay delayMs={1000}>
                <h1>{rank.name}</h1>
                <p>{rank.description}</p>
              </Delay>
            </div>
            <div class="user-img">
              <Delay delayMs={500}>
                <img
                  src={props.hotTake.userData.user.images.webp.image_url}
                  height="200px"
                />
              </Delay>
            </div>
          </div>
          <HotTakeBar percent={percent} width={1000} />
        </div>
        <div class="separator" />
        <div style="margin-left: 64px">
          <Delay delayMs={1500}>
            <div>
              <h2>Hottest take:</h2>
              <img src={props.hotTake.userData.topAnime.image} height="400px" />
              <div class="hottest-anime">
                <div>
                  <h3>{props.hotTake.userData.user.username}'s Score</h3>
                  <div>{props.hotTake.userData.topAnime.userScore}</div>
                </div>
                <div>
                  <h3>Average score</h3>
                  <div>{props.hotTake.userData.topAnime.rating}</div>
                </div>
              </div>
            </div>
          </Delay>
        </div>
      </div>
    </div>
  );
}
