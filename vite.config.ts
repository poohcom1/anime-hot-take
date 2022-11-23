import solid from "solid-start/vite";
// @ts-ignore
import vercel from "solid-start-vercel";
import { defineConfig } from "vite";
import dotenv from "dotenv";

export default defineConfig(() => {
  dotenv.config();

  return {
    plugins: [
      solid({
        ssr: false,
        babel: (_: any, id: any) => ({
          plugins: [["solid-styled", { source: id }]],
        }),
        adapter: vercel(),
      }),
    ],
  };
});
