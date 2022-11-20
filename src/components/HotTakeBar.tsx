import { css } from "solid-styled";

interface HotTakeBarProps {
  ref: HTMLDivElement;
  percent: number;
  startColor: string;
}

export function HotTakeBar(props: HotTakeBarProps) {
  css`
    .hot-take-bar__container {
      background-color: #8080801;
    }

    .hot-take-bar__progress {
      transition: background-color 0.5s;
    }
  `;

  return (
    <div ref={props.ref} class="hot-take-bar__container">
      <div class="hot-take-bar__progress"></div>
    </div>
  );
}
