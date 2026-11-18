/** `POST /api/survey`: validates a survey response and stores it in D1. */
// Wrangler bundles this outside SvelteKit, so imports stay relative.
import { HONEYPOT, allowedAnswerKeys, isOpen, waves } from "./lib/survey/wave";

export interface SurveyEnv {
  SURVEY_DB: {
    prepare(sql: string): { bind(...values: unknown[]): { run(): Promise<unknown> } };
  };
  SURVEY_RATE_LIMIT: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

export const MAX_BODY_BYTES = 64 * 1024;

const json = (status: number, error?: string, headers?: Record<string, string>) =>
  new Response(error ? JSON.stringify({ error }) : JSON.stringify({ ok: true }), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });

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

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export async function handleSurvey(
  request: Request,
  env: SurveyEnv,
  now: Date = new Date()
): Promise<Response> {
  if (request.method !== "POST") return json(405, "method not allowed", { Allow: "POST" });
  if (!(request.headers.get("Content-Type") ?? "").toLowerCase().startsWith("application/json"))
    return json(415, "expected application/json");

  const { success } = await env.SURVEY_RATE_LIMIT.limit({
    key: request.headers.get("CF-Connecting-IP") ?? "unknown",
  });
  if (!success) return json(429, "too many requests", { "Retry-After": "60" });

  const text = await readCapped(request);
  if (text === null) return json(413, "payload too large");

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json(400, "malformed JSON");
  }
  if (!isRecord(body)) return json(400, "expected a JSON object");

  if (body[HONEYPOT]) return json(400, "rejected");

  const def = typeof body.wave === "string" ? waves[body.wave] : undefined;
  if (!def) return json(400, "unknown wave");
  if (!isOpen(def, now)) return json(403, "wave closed");
  if (body.version !== def.version) return json(400, "wrong version");

  const { seconds, section_order: sectionOrder, answers } = body;
  if (seconds !== null && !(Number.isInteger(seconds) && (seconds as number) >= 0))
    return json(400, "invalid seconds");
  if (!Array.isArray(sectionOrder) || !sectionOrder.every((s) => typeof s === "string"))
    return json(400, "invalid section_order");
  if (!isRecord(answers)) return json(400, "invalid answers");
  const allowed = allowedAnswerKeys(def);
  if (Object.keys(answers).some((k) => !allowed.has(k))) return json(400, "unknown answer key");

  try {
    await env.SURVEY_DB.prepare(
      "INSERT INTO responses (id, wave, version, received_at, seconds, section_order, answers) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
      .bind(
        crypto.randomUUID(),
        def.wave,
        def.version,
        now.toISOString(),
        seconds,
        JSON.stringify(sectionOrder),
        JSON.stringify(answers)
      )
      .run();
  } catch (error) {
    console.error("survey: D1 insert failed", error);
    return json(500, "storage failed");
  }
  return json(201);
}
