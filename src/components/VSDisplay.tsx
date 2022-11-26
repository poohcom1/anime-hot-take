import { createMemo, Show } from "solid-js";
import { css } from "solid-styled";
import DisagreementImage from "~/assets/disagreements.png";
import AgreementImage from "~/assets/agreements.png";
import { PropAliases } from "solid-js/web";
import InfoPane from "./InfoPane";
import { formatNumber, formatText, objectToArray, omit } from "~/utils/object";

interface VSDisplayProps {
  ref?: HTMLDivElement;
  data: VsResult;
}

export default function VSDisplay(props: VSDisplayProps) {
  console.table(props.data.anime);

  const user1Fav = props.data.anime.find((a) => a.userScore > a.userScore2);
  const user2Fav = props.data.anime.find((a) => a.userScore2 > a.userScore);

  const rest = props.data.anime.filter(
    (a) => ![user1Fav?.id, user2Fav?.id].includes(a.id)
  );

  const reversed = [...props.data.anime]
    .filter((a) => !rest.slice(0, 5).find((b) => a.id === b.id))
    .sort((a, b) => b.userScore - a.userScore);

  reversed.sort(
    (a, b) =>
      Math.abs(a.userScore - a.userScore2) -
      Math.abs(b.userScore - b.userScore2)
  );

  console.log(`Compatability: ${(props.data.compatibility * 100).toFixed(2)}%`);

  const animeArr = createMemo(() =>
    objectToArray(
      props.data.anime.map((a) => omit(a, ["image", "meanScore", "id"])),
      (key) =>
        formatText(key)
          .replace("UserScore2", props.data.user2.username)
          .replace("UserScore", props.data.user1.username)
    )
  );

  css`
    .header {
      margin: 0;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header > * {
      margin: 0 16px;
    }

    .row {
      margin: 0;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .inner-row {
      display: flex;
    }

    .row-padding {
      flex: 1 1;
    }

    /* Table */
    th,
    td {
      padding: 4px;
    }
    tr:nth-child(odd) {
      background-color: #d6eeee11;
    }

    @media only screen and (max-width: 768px) {
      .row,
      .inner-row {
        display: block;
      }
    }
  `;

  return (
    <div ref={props.ref} style={{ width: "100%", padding: "32px" }}>
      <div class="header">
        <img src={props.data.user1.images.webp.image_url} height="100px" />
        <h2>VS</h2>
        <img src={props.data.user2.images.webp.image_url} height="100px" />
      </div>

      {/* Diff shows */}
      <div class="row">
        <div class="row-padding">
          {CircleIcon(DisagreementImage, "Disagreements", "red")}
        </div>
        <div class="inner-row">
          <Show when={user1Fav} keyed>
            {(a) => (
              <AnimeDisplay
                anime={a}
                username1={props.data.user1.username}
                username2={props.data.user2.username}
                love="user1"
                showColors
              />
            )}
          </Show>
          <Show when={user2Fav} keyed>
            {(a) => (
              <AnimeDisplay
                anime={a}
                username1={props.data.user1.username}
                username2={props.data.user2.username}
                love="user2"
                showColors
              />
            )}
          </Show>
          {rest.slice(0, 3).map((a) => (
            <AnimeDisplay
              anime={a}
              username1={props.data.user1.username}
              username2={props.data.user2.username}
              showColors
            />
          ))}
        </div>
        <div class="row-padding" />
      </div>
      <hr />
      {/* Similar shows */}
      <div class="row">
        <div class="row-padding" title="I love you~">
          {CircleIcon(AgreementImage, "Agreements", "green")}
        </div>
        <div class="inner-row">
          {reversed.slice(0, 5).map((a) => (
            <AnimeDisplay
              anime={a}
              username1={props.data.user1.username}
              username2={props.data.user2.username}
            />
          ))}
        </div>
        <div class="row-padding" />
      </div>
      <InfoPane>
        {" "}
        <table style={{ margin: "auto" }}>
          <tbody>
            {animeArr().map((row, index) => (
              <tr>
                {row.map((v) =>
                  index === 0 ? <th>{v}</th> : <td>{formatNumber(v, 0)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </InfoPane>
    </div>
  );
}

interface AnimeDisplayProps {
  anime: VSAnime;
  username1: string;
  username2: string;
  love?: "user1" | "user2";
  showColors?: boolean;
}

function AnimeDisplay(props: AnimeDisplayProps) {
  css`
    .like {
      color: ${props.showColors ? "lightgreen" : ""};
    }

    .dislike {
      color: ${props.showColors ? "#ed7589" : ""};
    }

    .hottest-takes {
      display: flex;
      justify-content: center;
    }

    .hottest-anime {
      margin: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .hottest-anime__scores > div {
      margin: 8px 8px;
    }

    .anime-title {
      text-align: center;
      padding: 0 16px;
      max-width: 200px;
      height: 45px;
      max-height: 50px;
      overflow: hidden;
      text-overflow: clip;
    }
  `;

  return (
    <div class="hottest-anime">
      <h4 class="anime-title" title={props.anime.title}>
        <span
          style={{
            "margin-right": "8px",
            display: "inline-flex",
            "align-items": "center",
          }}
        ></span>
        <a
          href={`https://myanimelist.net/anime/${props.anime.id}`}
          target="_blank"
        >
          {props.anime.title}
        </a>
      </h4>
      <a
        href={`https://myanimelist.net/anime/${props.anime.id}`}
        target="_blank"
      >
        <img src={props.anime.image} height="200px" />
      </a>
      <div class="hottest-anime__scores">
        <div>
          {props.love === "user1" && "♥ "}
          {props.username1}'s score:{" "}
          <strong
            class={
              props.anime.userScore > props.anime.userScore2
                ? "like"
                : "dislike"
            }
          >
            {props.anime.userScore}
          </strong>
        </div>
        <div>
          {props.love === "user2" && "♥ "}
          {props.username2}'s score:{" "}
          <strong
            class={
              props.anime.userScore < props.anime.userScore2
                ? "like"
                : "dislike"
            }
          >
            {props.anime.userScore2}
          </strong>
        </div>
      </div>
    </div>
  );
}

function CircleIcon(src: string, text: string, color: string) {
  return (
    <div>
      <img
        src={src}
        width="100px"
        style={{ "border-radius": "50%", border: "5px solid " + color }}
      />
      <h4 style={{ color: color }}>{text}</h4>
    </div>
  );
}
