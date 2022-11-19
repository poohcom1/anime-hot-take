import { children, JSX } from "solid-js";
import { css } from "solid-styled";

export default function Button(
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>
) {
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

    button:disabled {
      background-color: #2a2528;
    }
  `;
  return <button {...props}>{props.children}</button>;
}
