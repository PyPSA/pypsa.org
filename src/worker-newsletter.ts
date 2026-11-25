/** `POST /api/newsletter`: Turnstile check, then a Brevo double opt-in request. */
// Wrangler bundles this outside SvelteKit, so imports stay relative.
import { securityHeaders } from "./worker-headers";

export interface NewsletterEnv {
  BREVO_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  BREVO_LIST_ID?: string;
  BREVO_DOI_TEMPLATE_ID?: string;
  BREVO_DOI_REDIRECT_URL?: string;
}

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const BREVO_DOI = "https://api.brevo.com/v3/contacts/doubleOptinConfirmation";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function reply(pathname: string, status: number, body: { ok: true } | { error: string }): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...securityHeaders(pathname),
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

const isPositiveInt = (value: string) => /^[1-9]\d*$/.test(value);

/** A 425, or a 400 with Brevo's `duplicate_parameter` code, means the address is already known. */
async function alreadySubscribed(res: Response): Promise<boolean> {
  if (res.status === 425) return true;
  if (res.status !== 400) return false;
  return ((await res.json()) as { code?: string }).code === "duplicate_parameter";
}

export async function handleNewsletter(request: Request, env: NewsletterEnv): Promise<Response> {
  const { pathname } = new URL(request.url);
  const fail = (status: number, error: string) => reply(pathname, status, { error });

  const {
    BREVO_API_KEY,
    TURNSTILE_SECRET_KEY,
    BREVO_LIST_ID,
    BREVO_DOI_TEMPLATE_ID,
    BREVO_DOI_REDIRECT_URL,
  } = env;
  if (
    !BREVO_API_KEY ||
    !TURNSTILE_SECRET_KEY ||
    !BREVO_DOI_REDIRECT_URL ||
    !BREVO_LIST_ID ||
    !isPositiveInt(BREVO_LIST_ID) ||
    !BREVO_DOI_TEMPLATE_ID ||
    !isPositiveInt(BREVO_DOI_TEMPLATE_ID)
  ) {
    return fail(500, "Newsletter signup is not configured");
  }

  let email: unknown;
  let token: unknown;
  try {
    const body = (await request.json()) as Record<string, unknown> | null;
    email = body?.email;
    token = body?.["cf-turnstile-response"];
  } catch {
    return fail(400, "Invalid request");
  }
  if (typeof email !== "string" || email.length > 254 || !EMAIL.test(email)) {
    return fail(400, "Invalid email address");
  }
  if (typeof token !== "string" || !token) return fail(400, "Turnstile check failed");

  try {
    const form = new URLSearchParams({ secret: TURNSTILE_SECRET_KEY, response: token });
    const ip = request.headers.get("CF-Connecting-IP");
    if (ip) form.set("remoteip", ip);
    const res = await fetch(SITEVERIFY, { method: "POST", body: form });
    const result = (await res.json()) as { success?: boolean };
    if (!result.success) return fail(400, "Turnstile check failed");
  } catch {
    return fail(502, "Could not verify the Turnstile check");
  }

  try {
    const res = await fetch(BREVO_DOI, {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        includeListIds: [Number(BREVO_LIST_ID)],
        templateId: Number(BREVO_DOI_TEMPLATE_ID),
        redirectionUrl: BREVO_DOI_REDIRECT_URL,
      }),
    });
    if (res.ok || (await alreadySubscribed(res))) return reply(pathname, 200, { ok: true });
    return fail(502, "Signup failed, please try again later");
  } catch {
    return fail(502, "Signup failed, please try again later");
  }
}
