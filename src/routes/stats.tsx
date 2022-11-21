import { createResource, Show } from "solid-js";
import { unstable_clientOnly } from "solid-start";
import { css } from "solid-styled";
import type { StatsResponse } from "./api/stats";
// const Histogram = unstable_clientOnly(
//   async () => await import("~/components/Histogram")
// );

export default function Index() {
  const [scores] = createResource(async () => {
    const res = await fetch("/api/stats");
    const scores = await res.json();
    return scores as StatsResponse;
  });

  css`
    main {
      display: flex;
      justify-content: center;
      padding: 64px;
    }
  `;

  return (
    <main>
      <Show when={scores.state === "ready" && scores()} keyed>
        {/* {(f) => <Histogram data={f.scores} />} */}
      </Show>
    </main>
  );
}
