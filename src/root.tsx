// @refresh reload
import { Suspense } from "solid-js";
import { useAssets } from "solid-js/web";
import {
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";
import { css, renderSheets, StyleData, StyleRegistry } from "solid-styled";

function GlobalStyles() {
  css`
    @global {
      html {
        height: 100%;
      }

      body {
        font-family: Gordita, Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans",
          "Helvetica Neue", sans-serif;
        padding: 0;
        margin: 0;
        height: 100%;
        font-size: larger;
        display: flex;
        flex-direction: column;
      }

      a {
        color: white;
        text-decoration: none;
        margin: 0;
      }

      a:hover {
        text-decoration: underline;
      }

      main {
        text-align: center;
        padding: 0;
        margin: 0;
      }

      h1 {
        display: block;
        color: #335d92;
        text-transform: uppercase;
        font-size: 4rem;
        font-weight: 100;
        line-height: 1.1;
        margin: 4rem auto;
        max-width: 14rem;
      }

      p {
        margin: 2rem auto;
        line-height: 1.35;
      }

      @media only screen and (max-width: 1000px) {
        h1 {
          margin: 2rem auto;
          font-size: 2rem;
        }
      }

      @media (min-width: 480px) {
        h1 {
          max-width: none;
        }

        p {
          max-width: none;
        }
      }
    }
  `;
  return null;
}

export default function Root() {
  const sheets: StyleData[] = [];
  useAssets(() => renderSheets(sheets));

  return (
    <StyleRegistry styles={sheets}>
      <Html lang="en">
        <Head>
          <Title>Anime Hot Takes</Title>
          <Meta charset="utf-8" />
          <Meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Body>
          <GlobalStyles />
          <Suspense>
            <ErrorBoundary>
              <Routes>
                <FileRoutes />
              </Routes>
            </ErrorBoundary>
          </Suspense>
          <Scripts />
        </Body>
      </Html>
    </StyleRegistry>
  );
}
