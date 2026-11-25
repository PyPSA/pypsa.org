import { markdownFor } from "$lib/site/markdown";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = () =>
  new Response(markdownFor("/newsletter/confirmed"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
