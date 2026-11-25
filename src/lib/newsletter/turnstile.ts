const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    }
  ): string;
  reset(widgetId?: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

/** Inject the Turnstile script once per page. Browser only. */
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    el.src = SCRIPT_SRC;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => {
      scriptPromise = null;
      el.remove();
      reject(new Error("Could not load Turnstile"));
    };
    document.head.appendChild(el);
  });
  return scriptPromise;
}

/** Lazy Turnstile widget, `token` is set once the challenge passes. */
export class Turnstile {
  token: string | null = null;
  private widgetId: string | null = null;

  constructor(
    private readonly siteKey: string,
    private readonly onChange: () => void = () => {}
  ) {}

  async load(container: HTMLElement): Promise<void> {
    if (this.widgetId !== null) return;
    await loadScript();
    if (this.widgetId !== null || !window.turnstile) return;
    this.widgetId = window.turnstile.render(container, {
      sitekey: this.siteKey,
      callback: (token) => this.set(token),
      "expired-callback": () => this.set(null),
      "error-callback": () => this.set(null),
    });
  }

  reset(): void {
    this.set(null);
    if (this.widgetId !== null) window.turnstile?.reset(this.widgetId);
  }

  private set(token: string | null) {
    this.token = token;
    this.onChange();
  }
}
