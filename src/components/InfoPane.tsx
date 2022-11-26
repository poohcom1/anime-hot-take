import { Collapse } from "solid-collapse";
import { createSignal, JSXElement } from "solid-js";
import { FaSolidCircleInfo as InfoCircle } from "solid-icons/fa";
import style from "./InfoPane.module.css";
import { css } from "solid-styled";

interface InfoPaneProps {
  children: JSXElement;
}

export default function InfoPane(props: InfoPaneProps) {
  const [showInfo, setShowInfo] = createSignal(false);

  const toggleInfo = () => {
    const show = showInfo();
    setShowInfo(!showInfo());
    if (!show) {
      setTimeout(
        () =>
          document
            .querySelector(".info-section")
            ?.scrollIntoView({ behavior: "smooth" }),
        300
      );
    }
  };

  css`
    .info-section {
      width: 80vw;
      margin: 16px auto;
      color: gray;
      overflow: hidden;
      border-radius: 8px;
      background-color: ${showInfo() ? "#ffffff0a" : "transparent"};
    }

    .info-section-toggle {
      padding: 16px;
      display: flex;
      justify-content: start;
      align-items: center;
      transition: background-color 0.2s;
    }

    .info-section-toggle:hover {
      background-color: #ffffff22;
    }

    .info-text {
      margin: 0;
      padding: 16px;
      text-align: left;
    }

    .info-text > p {
      margin: 4px 0;
    }
  `;

  return (
    <div class="info-section">
      <div class="info-section-toggle" onClick={toggleInfo}>
        <InfoCircle style={{ "margin-left": "0px" }} />
        <span style={{ "margin-left": "8px", "user-select": "none" }}>
          More Info
        </span>
      </div>
      <Collapse value={showInfo()} class={`${style.infoCollapse}`}>
        <div class="info-text">{props.children}</div>
      </Collapse>
    </div>
  );
}
