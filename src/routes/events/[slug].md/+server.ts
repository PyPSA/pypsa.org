import { eventsData } from "$lib/data/events";
import { markdownFor } from "$lib/site/markdown";
import type { EntryGenerator, RequestHandler } from "./$types";

export const prerender = true;

export const entries: EntryGenerator = () => eventsData.map((e) => ({ slug: e.slug }));

export const GET: RequestHandler = ({ params }) => {
  const body = markdownFor(`/events/${params.slug}`);
  return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
};
