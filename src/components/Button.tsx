import { children, JSX } from "solid-js";
import { css } from "solid-styled";

interface ButtonProps {
  onClick?: () => void;
  children?: JSX.Element;
}

export default function Button(props: ButtonProps) {
  css`
    button {
      border: none;
      border-radius: 4px;
      color: white;
      padding: 8px 16px;

      background-color: #96106a;
    }

    button:hover {
      background-color: #690c4a;
    }

    button:active {
      background-color: #510839;
    }
  `;
  return <button onclick={props.onClick}>{props.children}</button>;
}
