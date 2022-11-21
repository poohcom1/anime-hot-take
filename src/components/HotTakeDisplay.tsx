import { createSignal, JSX, mergeProps } from "solid-js";
import { css } from "solid-styled";
import HotTakeBar from "./HotTakeBar";

interface HotTakeDisplayProps {
  hotTake: HotTakeResult;
}

export default function HotTakeDisplay(props: HotTakeDisplayProps) {
  return (
    <div>
      <Delay delayMs={100}>
        <img src={props.hotTake.userData.user.images.webp.image_url} />
      </Delay>
      <Delay delayMs={500}>
        <h3>{props.hotTake.userData.user.username}'s rank:</h3>
      </Delay>
      <Delay delayMs={1000}>
        <h1>{props.hotTake.userData.score.toFixed(1)}</h1>
      </Delay>
      <HotTakeBar percent={props.hotTake.userData.score / 2.0} width={1000} />
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
