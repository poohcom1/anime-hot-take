import solid from "solid-start/vite";
import vercel from "solid-start-vercel";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    solid({
      ssr: false,
      babel: (_: any, id: any) => ({
        plugins: [["solid-styled", { source: id }]],
      }),
      adapter: vercel(),
    }),
  ],
});
