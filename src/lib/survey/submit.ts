// Posts a finished response to the Worker and maps the outcome to what the page shows.

export type SubmitResult =
  | { kind: "ok" }
  /** Network error or 5xx: show Retry and keep the answers. */
  | { kind: "retry"; message: string }
  /** 429 or another 4xx: show the text, retrying the same payload will not help right away. */
  | { kind: "rejected"; message: string };

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
  let message = `The survey could not be submitted (error ${res.status}).`;
  try {
    const body = (await res.json()) as { error?: unknown };
    if (typeof body.error === "string" && body.error) message = body.error;
  } catch {
    // Body is not JSON, keep the generic message.
  }
  return { kind: "rejected", message };
}
