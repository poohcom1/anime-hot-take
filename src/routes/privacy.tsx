import { css } from "solid-styled";

export default function Privacy() {
  css`
    h1 {
      display: inline-block;
    }
  `;

  return (
    <main>
      <div>
        <h1>Privacy Policy</h1>
        <div>
          We store your computed hot-take score to be compared with other users.
          The only data we store is your username and score. We also randomly
          scrape user scores from MAL to retreive their score value.
        </div>
      </div>
    </main>
  );
}
