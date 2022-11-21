import { JSX, mergeProps, createSignal } from "solid-js";
import { css } from "solid-styled";

interface DelayedDisplayProps {
  class?: string;
  children: JSX.Element;
  delayMs?: number;
  transitionMs?: number;
}

export default function Delay(baseProps: DelayedDisplayProps) {
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

  return <div class={`container ${props.class}`}>{props.children}</div>;
}
