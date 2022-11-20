import interpolate from "color-interpolate";
import { createEffect, createSignal, mergeProps } from "solid-js";
import { css } from "solid-styled";

interface HotTakeBarProps {
  ref?: HTMLDivElement;
  width: number;
  height?: number;
  percent: number;
  emptyColor?: string;
  fullColor?: string;
}

export default function HotTakeBar(partialProps: HotTakeBarProps) {
  const props = mergeProps(
    { emptyColor: "blue", fullColor: "#ff0000", height: 40 },
    partialProps
  );

  const color_lerp = interpolate([props.emptyColor, props.fullColor]);

  const containerHeight = props.height + "px";
  const height = props.height - 4 + "px";

  const fullWidth = props.width + "px";

  const [percent, setProgressWidth] = createSignal("0px");
  const [color, setColor] = createSignal(props.emptyColor);

  setTimeout(() => {
    setProgressWidth(props.width * props.percent + "px");
    setColor(color_lerp(11));
  }, 10);

  css`
    .container {
      padding-top: 3px;
      height: ${containerHeight};
      border-left: 2px solid white;
      border-right: 2px solid white;
      width: ${fullWidth};
      margin: auto;
    }

    .background {
      background-color: #ffffff22;
      border-left: 1 solid white;
      border-right: 1 solid white;
      height: ${height};
    }

    .progress {
      transition: background-color 0.5s;
      height: inherit;
      width: ${percent()};
      transition: width 4s, background-color 4s;
      background-color: ${color()};
      margin-right: auto;
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
