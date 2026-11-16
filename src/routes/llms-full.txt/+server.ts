import { llmsFullTxt } from "$lib/site/discovery";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = () =>
  new Response(llmsFullTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
