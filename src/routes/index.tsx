import { redirect } from "solid-start";
import HotTakes from "./hot-takes";

export function GET() {
  return redirect("/hot-takes");
}

export default function Index() {
  return HotTakes;
}
