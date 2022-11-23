import interpolate from "color-interpolate";
import { createEffect, createSignal, mergeProps } from "solid-js";
import { css } from "solid-styled";

interface HotTakeBarProps {
  ref?: HTMLDivElement;
  width: number;
  height?: number;
  percent: number;
  animTime?: number;
}

const COLORS = ["#0000ff", "#6a108a", "#ffd900", "#ff0000"];

export default function GradientProgress(partialProps: HotTakeBarProps) {
  const props = mergeProps({ height: 40, animTime: 4 }, partialProps);

  const colorLerp = interpolate(COLORS);

  const containerHeight = props.height + "px";
  const height = props.height - 4 + "px";

  const [width, setWidth] = createSignal("0%");
  const [color, setColor] = createSignal(COLORS[0]);

  setTimeout(() => {
    setWidth(props.percent * 100 + "%");
    setColor(colorLerp(props.percent));
  }, 10);

  css`
    .container {
      padding-top: 3px;
      height: ${containerHeight};
      border-left: 2px solid white;
      border-right: 2px solid white;
      width: 100%;
      margin: auto;
    }

    .background {
      background-color: #ffffff22;
      border-left: 1 solid white;
      border-right: 1 solid white;
      height: ${height};
      width: 100%;
    }

    .progress {
      height: inherit;
      width: ${width()};
      opacity: 90%;
      transition: width ${props.animTime + "s"},
        background-color ${props.animTime + "s"},
        box-shadow ${props.animTime + "s"};
      background-color: ${color()};
      box-shadow: 0 0 15px ${color()};
      margin-right: auto;

      display: flex;
      justify-content: end;
      align-items: center;
      padding-right: 8px;
      font-weight: 900;
    }
  `;

  return (
    <div ref={props.ref} class="container">
      <div class="background">
        <div class="progress"></div>
      </div>
    </div>
  );
}
