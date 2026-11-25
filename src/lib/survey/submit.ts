import type { ErrorCode } from "./wave";
import { surveyMeta } from "./current";

// Posts a finished response to the Worker and maps the outcome to what the page shows.

export type SubmitResult =
  | { kind: "ok" }
  /** Network error or 5xx: show Retry and keep the answers. */
  | { kind: "retry"; message: string }
  /** 429, show the text and allow Retry after `retryAfter` seconds. */
  | { kind: "rateLimited"; message: string; retryAfter: number }
  /** Another 4xx, where retrying the same payload will not help. */
  | { kind: "rejected"; message: string };

const COPY: Record<ErrorCode, string> = {
  unsupported_media_type:
    "Your browser sent the answers in an unexpected format. Please reload the page and try again.",
  method_not_allowed:
    "Your browser sent the answers in an unexpected way. Please reload the page and try again.",
  rate_limited: "Too many submissions from your network, try again in a minute.",
  payload_too_large:
    "Your answers are too large to submit. Please shorten your longest free-text answers.",
  malformed_json:
    "Your answers could not be read by the server. Please reload the page and try again.",
  not_object: "Your answers could not be read by the server. Please reload the page and try again.",
  unknown_wave: "This survey is no longer available. Please reload the page.",
  wave_closed: "This survey has closed and no longer accepts answers.",
  wrong_version:
    "The survey was updated while you were answering. Please reload the page and try again.",
  invalid_seconds:
    "Your answers could not be validated (invalid timing). Please reload the page and try again.",
  invalid_section_order:
    "Your answers could not be validated (section order). Please reload the page and try again.",
  invalid_answers: "Some of your answers are not valid. Please review them and try again.",
  unknown_answer_key:
    "Some of your answers do not belong to this survey version. Please reload the page and try again.",
  invalid_choice: "One of your choices is not valid. Please review your answers and try again.",
  invalid_matrix_cell:
    "One of your table answers is not valid. Please review your answers and try again.",
  invalid_number:
    "One of your numeric answers is not valid. Please review your answers and try again.",
  text_too_long: "One of your free-text answers is too long. Please shorten it and try again.",
  missing_required: "Please answer the required questions in section 1 before submitting.",
  too_many_top3: "Please select at most three items in the Top 3 question.",
  too_many_picks: "You selected too many options in one question. Please review your answers.",
  storage_failed: "The server could not save your answers. They are kept; please try again.",
};

/** Plain-text copy for a Worker error code, never the raw code. */
export function errorCopy(code: string): string {
  if (Object.hasOwn(COPY, code)) return COPY[code as ErrorCode];
  return `The survey could not be submitted. Please contact ${surveyMeta.contact}.`;
}

function parseRetryAfter(header: string | null): number {
  const n = Number.parseInt(header ?? "", 10);
  if (!Number.isFinite(n)) return 60;
  return Math.min(600, Math.max(1, n));
}

type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

export async function submitResponse(
  payload: unknown,
  doFetch: Fetch = (url, init) => fetch(url, init)
): Promise<SubmitResult> {
  let res: Response;
  try {
    res = await doFetch("/api/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      kind: "retry",
      message: "We could not reach the server. Your answers are kept; please try again.",
    };
  }
  if (res.status === 201) return { kind: "ok" };
  if (res.status >= 500) {
    return {
      kind: "retry",
      message: "The server had a problem saving your answers. They are kept; please try again.",
    };
  }
  if (res.status === 429) {
    return {
      kind: "rateLimited",
      message: errorCopy("rate_limited"),
      retryAfter: parseRetryAfter(res.headers.get("Retry-After")),
    };
  }
  let code = "";
  try {
    const body = (await res.json()) as { error?: unknown };
    if (typeof body.error === "string") code = body.error;
  } catch {
    // Body is not JSON, use the generic copy.
  }
  return { kind: "rejected", message: errorCopy(code) };
}
