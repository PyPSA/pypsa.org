import { routes } from "$lib/site/routes";
import { markdownFor, notFoundMarkdown } from "$lib/site/markdown";
import type { EntryGenerator, RequestHandler } from "./$types";

export const prerender = true;

/** `index` is `/`, `404` is the 404 page, the rest are top-level registry paths. */
export const entries: EntryGenerator = () =>
  [
    ...routes.filter((r) => !r.path.startsWith("/events/")).map((r) => r.mdPath.slice(1, -3)),
    "404",
  ].map((page) => ({ page }));

export const GET: RequestHandler = ({ params }) => {
  const body =
    params.page === "404"
      ? notFoundMarkdown()
      : markdownFor(params.page === "index" ? "/" : `/${params.page}`);
  return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
};
