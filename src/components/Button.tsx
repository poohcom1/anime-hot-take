import { JSX, JSXElement, mergeProps } from "solid-js";
import { css } from "solid-styled";
import Color from "color";

interface ButtonProps {
  class?: string;
  onClick?: () => void;
  disabled?: boolean;
  color?: string;
  width?: string;
  children?: JSXElement;
}

export default function Button(baseProps: ButtonProps) {
  const props = mergeProps({ color: "#96106a" }, baseProps);

  css`
    button {
      margin: 16px;
      border: none;
      border-radius: 4px;
      color: white;
      padding: 8px 16px;
      width: ${props.width ?? ""};

      background-color: ${Color(props.color).toString()};
      transition: background-color 0.2s, width 0.2s;
    }

    button:hover {
      background-color: ${Color(props.color).darken(0.2).toString()};
    }

    button:active {
      background-color: ${Color(props.color).darken(0.5).toString()};
    }

    button:disabled {
      background-color: #2a2528;
    }
  `;
  return <button {...props}>{props.children}</button>;
}
