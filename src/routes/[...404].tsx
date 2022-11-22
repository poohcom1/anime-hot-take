import { Title } from "solid-start";
import { HttpStatusCode } from "solid-start/server";
import NotFoundImage from "~/assets/404_zetsubou_sayonara.jpg";

export default function NotFound() {
  return (
    <main>
      <Title>Not Found</Title>
      <HttpStatusCode code={404} />
      <h1>Page Not Found</h1>
      <img src={NotFoundImage} alt="Not found" />
    </main>
  );
}
