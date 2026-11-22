/** `POST /api/survey`: validates a survey response and stores it in D1. */
// Wrangler bundles this outside SvelteKit, so imports stay relative.
import {
  HONEYPOT,
  isOpen,
  isRecord,
  validateResponse,
  waves,
  type ErrorCode,
} from "./lib/survey/wave";

export interface SurveyEnv {
  SURVEY_DB: {
    prepare(sql: string): { bind(...values: unknown[]): { run(): Promise<unknown> } };
  };
  SURVEY_RATE_LIMIT: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

export const MAX_BODY_BYTES = 256 * 1024;

const STATUS: Partial<Record<ErrorCode, number>> = {
  unsupported_media_type: 415,
  method_not_allowed: 405,
  rate_limited: 429,
  payload_too_large: 413,
  wave_closed: 403,
  storage_failed: 500,
};

const reply = (status: number, headers?: Record<string, string>, body: unknown = { ok: true }) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });

const fail = (code: ErrorCode, headers?: Record<string, string>) =>
  reply(STATUS[code] ?? 400, headers, { error: code });

const JSON_TYPE = /^application\/json(\s*;\s*charset=[\w-]+)?$/i;

/** Body text, or null once it exceeds the cap. Works without a Content-Length header. */
async function readCapped(request: Request): Promise<string | null> {
  const declared = Number(request.headers.get("Content-Length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder().decode(all);
}

export async function handleSurvey(
  request: Request,
  env: SurveyEnv,
  now: Date = new Date()
): Promise<Response> {
  if (request.method !== "POST") return fail("method_not_allowed", { Allow: "POST" });
  if (!JSON_TYPE.test(request.headers.get("Content-Type") ?? ""))
    return fail("unsupported_media_type");

  const { success } = await env.SURVEY_RATE_LIMIT.limit({
    key: request.headers.get("CF-Connecting-IP") ?? "unknown",
  });
  if (!success) return fail("rate_limited", { "Retry-After": "60" });

  const text = await readCapped(request);
  if (text === null) return fail("payload_too_large");

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return fail("malformed_json");
  }
  if (!isRecord(body)) return fail("not_object");

  // A bot filled the hidden field: pretend success and store nothing.
  if (body[HONEYPOT]) return reply(201);

  const def = typeof body.wave === "string" ? waves[body.wave] : undefined;
  if (!def) return fail("unknown_wave");
  if (!isOpen(def, now)) return fail("wave_closed");
  const checked = validateResponse(def, body);
  if (!checked.ok) return fail(checked.code);

  try {
    await env.SURVEY_DB.prepare(
      "INSERT INTO responses (id, wave, version, received_at, seconds, section_order, answers) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
      .bind(
        crypto.randomUUID(),
        def.wave,
        def.version,
        now.toISOString(),
        body.seconds,
        JSON.stringify(body.section_order),
        JSON.stringify(body.answers)
      )
      .run();
  } catch (error) {
    console.error("survey: D1 insert failed", error);
    return fail("storage_failed");
  }
  return reply(201);
}
