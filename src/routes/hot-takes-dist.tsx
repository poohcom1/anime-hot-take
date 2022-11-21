import { createEffect, createSignal } from "solid-js";
import server$ from "solid-start/server";
import { getMongoClient } from "~/server/mongodb";
import { unstable_clientOnly } from "solid-start";
import { css } from "solid-styled";
import Histogram from "~/components/Histogram";

export default function Index() {
  const [scores, setScores] = createSignal<number[]>([]);

  createEffect(async () => {
    const scores = await server$(async () => {
      const mongoClient = getMongoClient();

      const users = (await mongoClient
        .db()
        .collection("scores")
        .find({})
        .toArray()) as unknown as DBUser[];

      return users.map((u) => Math.round(u.score * 10) / 10);
    })();

    setScores(scores);
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
      <Histogram data={scores()} />
    </main>
  );
}
