# Deployment

The site runs on **Cloudflare Workers** (Workers Builds, Git-connected) with
`@sveltejs/adapter-cloudflare`. Every route is prerendered and served as a
static asset via the `ASSETS` binding; the worker itself only serves those
assets (there are no server routes or form actions).

Deploy config lives in `wrangler.jsonc` (repo root): `main` points at the
adapter's `.svelte-kit/cloudflare/_worker.js`, assets dir is
`.svelte-kit/cloudflare`. The adapter auto-emits a `.assetsignore` (so the
worker bundle isn't served as a public asset) **only when it detects the
wrangler config at build time** - keep `wrangler.jsonc` committed.

## 1. Connect the repo (one-time)

Cloudflare Dashboard -> **Workers & Pages -> Create -> Workers -> Import a
repository** -> pick the pypsa.org repo.

Build settings:

| Setting           | Value                           |
| ----------------- | ------------------------------- |
| Build command     | `npm run build`                 |
| Deploy command    | `npx wrangler deploy` (default) |
| Production branch | `master`                        |

No "build output directory" field in the Workers flow - `wrangler.jsonc`
defines what gets deployed. Add a build variable `NODE_VERSION = 22` (CF
defaults to an older Node otherwise).

## 2. Deployments & preview instances

- **Production** = pushes to `master` -> `https://www.pypsa.org` (after the
  custom domain is mapped, see step 3).
- **Preview (deploy per PR)** = Workers Builds builds every push to a
  **non-production** branch and every PR, each getting its own **version
  preview URL** (`https://<version>-pypsa-org-website.<subdomain>.workers.dev`).
  Enable it in Worker -> Settings -> Builds -> "Build branches"
  (non-production branches) and turn on preview URLs.

  Note: pushes to `master` go to **production**, not a preview. For a
  throwaway instance, push to a branch / open a PR.

## 3. Custom domain + DNS cutover

The domain currently points at GitHub Pages. To move it:

1. Worker -> Settings -> **Domains & Routes** -> add `www.pypsa.org` (and
   optionally the apex `pypsa.org` with a redirect to `www`).
2. Update DNS for `pypsa.org`: remove the GitHub Pages records
   (`www` CNAME -> `<org>.github.io`, and the apex A/AAAA records pointing at
   GitHub's IPs) and let Cloudflare create the records for the custom domain.
   If DNS is already on Cloudflare this is automatic once you add the domain in
   the Worker; if DNS lives elsewhere, point `www` at the worker per the
   dashboard instructions.
3. GitHub Pages keeps serving the old build until DNS flips, so there is no
   downtime. After the worker is verified live you can disable GitHub Pages in
   the repo settings.

The `.github/workflows/deploy.yml` GitHub Pages workflow has been removed; there
is no `CNAME` file in the repo (the GH Pages domain was set in the Pages UI).

## 4. Local development

```bash
npm install
npm run dev
```

There are no environment variables or secrets - the site is fully static.

## 5. Verifying the config

`npx wrangler deploy --dry-run` validates `wrangler.jsonc` and the built worker
without deploying. `npm run build` runs the adapter, which emits
`.svelte-kit/cloudflare/_worker.js` and `.assetsignore`.

Note: the two 23 MB Plotly exports in `static/explore/` are under Cloudflare's
25 MiB per-asset limit, but only just - keep an eye on that if they grow.
