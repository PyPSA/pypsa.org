/** Page-route Worker, sets the headers that `_headers` cannot add to Worker responses. */
// Wrangler bundles this outside SvelteKit, so imports stay relative.
import { mdPathOf } from "./lib/site/md-path";
import { securityHeaders } from "./worker-headers";
import { handleNewsletter, type NewsletterEnv } from "./worker-newsletter";

interface Env extends NewsletterEnv {
  ASSETS: { fetch(req: Request): Promise<Response> };
}

const MARKDOWN_TYPE = "text/markdown; charset=utf-8";

/** q-value of `type` in an Accept header, 0 when absent. Wildcards are ignored. */
function qOf(accept: string, type: string): number {
  for (const part of accept.split(",")) {
    const [media, ...params] = part.split(";").map((s) => s.trim());
    if (media.toLowerCase() !== type) continue;
    const q = params.find((p) => p.toLowerCase().startsWith("q="));
    const value = q ? Number(q.slice(2)) : 1;
    return Number.isFinite(value) ? value : 0;
  }
  return 0;
}

function wantsMarkdown(request: Request): boolean {
  const accept = request.headers.get("Accept") ?? "";
  const md = qOf(accept, "text/markdown");
  return md > 0 && md >= qOf(accept, "text/html");
}

/** True when the last path segment has a file extension. */
const hasExtension = (pathname: string) => /\.[^/]+$/.test(pathname);

function finish(res: Response, pathname: string, contentType?: string): Response {
  const out = new Response(res.body, res);
  const headers = securityHeaders(pathname);
  // Drop an X-Frame-Options the asset layer may have added on a frameable page.
  if (!("X-Frame-Options" in headers)) out.headers.delete("X-Frame-Options");
  for (const [name, value] of Object.entries(headers)) out.headers.set(name, value);
  if (contentType) out.headers.set("Content-Type", contentType);
  out.headers.set("Vary", "Accept");
  return out;
}

async function markdown(request: Request, env: Env, url: URL): Promise<Response> {
  const asset = (path: string) =>
    env.ASSETS.fetch(new Request(new URL(path, url), { method: request.method }));

  const mirror = await asset(mdPathOf(url.pathname));
  if (mirror.ok) return finish(mirror, url.pathname, MARKDOWN_TYPE);

  // Aliases and /embed pages have no mirror but still exist.
  const html = await env.ASSETS.fetch(request);
  if (html.status !== 404) return finish(html, url.pathname);

  const notFound = await asset("/404.md");
  return finish(
    new Response(notFound.body, { status: 404, headers: notFound.headers }),
    url.pathname,
    MARKDOWN_TYPE
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/newsletter") {
      if (request.method === "POST") return handleNewsletter(request, env);
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { ...securityHeaders(url.pathname), Allow: "POST", "Cache-Control": "no-store" },
      });
    }
    const negotiable =
      (request.method === "GET" || request.method === "HEAD") && !hasExtension(url.pathname);
    if (negotiable && wantsMarkdown(request)) return markdown(request, env, url);
    return finish(await env.ASSETS.fetch(request), url.pathname);
  },
};
