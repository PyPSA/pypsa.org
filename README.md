# PyPSA Project Website

This repository contains all code for the pypsa website www.pypsa.org.

The website is based on the [template](https://github.com/leoMirandaa/shadcn-landing-page) created by [Leopoldo Miranda](https://github.com/leoMirandaa).

## Stack and deployment

SvelteKit with `adapter-static` builds the site into `build/`. Cloudflare serves it through a custom Worker in `src/worker.ts`, which sets the security headers, serves the markdown mirrors and handles `POST /api/newsletter`. The CSP lives in the Worker and in `static/_headers`, and the two must stay equal.

## Newsletter

Signups use Brevo double opt-in with Cloudflare Turnstile.

- Route: `POST /api/newsletter`, handled in `src/worker-newsletter.ts`. The forms are in the footer and on `/newsletter`; `/newsletter/confirmed` is where the confirmation mail lands.
- Worker vars in `wrangler.jsonc`: `BREVO_LIST_ID`, `BREVO_DOI_TEMPLATE_ID`, `BREVO_DOI_REDIRECT_URL`.
- Secrets, set with `wrangler secret put`: `BREVO_API_KEY` and `TURNSTILE_SECRET_KEY`.
- The public Turnstile site key is the `TURNSTILE_SITE_KEY` constant in `src/lib/config/meta.ts`.
- Email templates live in `brevo/`. Copy `.env.example` to `.env` and fill it in, then run `npm run brevo:sync` to push `brevo/doi.html` to the DOI template.
- `npm run brevo:campaign -- <content.html> <subject>` inserts the file at the `<!-- CONTENT -->` marker of `brevo/campaign.html` and creates a draft campaign. It never schedules or sends; do that in Brevo.
