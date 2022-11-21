import { createSignal, JSX, mergeProps } from "solid-js";
import { css } from "solid-styled";
import HotTakeBar from "./HotTakeBar";

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

    .hottestAnime {
      display: flex;
      justify-content: center;
    }

    .hottestAnime > div {
      margin: 16px;
    }
  `;

  return (
    <div id={props.id} ref={props.ref}>
      <Delay delayMs={100}>
        <img
          src={props.hotTake.userData.user.images.webp.image_url}
          height="200px"
        />
      </Delay>
      <Delay delayMs={500}>
        <h3>{props.hotTake.userData.user.username}'s rank:</h3>
      </Delay>
      <Delay delayMs={1000}>
        <h1>{props.hotTake.userData.score.toFixed(1)}</h1>
      </Delay>
      <HotTakeBar percent={props.hotTake.userData.score / 3} width={1000} />
      <Delay delayMs={1100}>
        <div>
          <h2>Your hottest take</h2>
          <img src={props.hotTake.userData.topAnime.image} />
          <div class="hottestAnime">
            <div>
              <h3>Your score</h3>
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
  );
}

interface DelayedDisplayProps {
  children: JSX.Element;
  delayMs?: number;
  transitionMs?: number;
}

function Delay(baseProps: DelayedDisplayProps) {
  const props = mergeProps({ delayMs: 0, transitionMs: 500 }, baseProps);

  const [show, setShow] = createSignal(false);

  css`
    .container,
    .container * {
      opacity: ${show() ? "100%" : "0%"};
      transition: opacity ${props.transitionMs / 1000 + "s"};
    }
  `;

  setTimeout(() => setShow(true), props.delayMs);

  return <div class="container">{props.children}</div>;
}
