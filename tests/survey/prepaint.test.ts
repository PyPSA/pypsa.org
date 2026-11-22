import { describe, expect, it } from "vitest";
import { securityHeaders } from "../../src/worker-headers";
import { bannerKey, prepaintScript } from "../../src/lib/survey/prepaint";
import { storageKey } from "../../src/lib/survey/progress";

const def = {
  wave: "2026-h2",
  opens: "2026-11-18T00:00:00+01:00",
  closes: "2026-12-14T00:00:00+01:00",
};

function run(now: string, stored: string | null, throwing = false, path = "/", progress = false) {
  const attrs: Record<string, string> = {};
  const doc = { documentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v) } };
  const ls = {
    getItem: (k: string) => {
      if (throwing) throw new Error("denied");
      if (k === storageKey(def)) return progress ? "{}" : null;
      return k === bannerKey(def.wave) ? stored : null;
    },
  };
  const RealDate = Date;
  class FakeDate extends RealDate {
    constructor(...a: unknown[]) {
      super(...((a.length ? a : [now]) as [string]));
    }
    static now() {
      return new RealDate(now).getTime();
    }
  }
  new Function("document", "localStorage", "location", "Date", prepaintScript(def))(
    doc,
    ls,
    { pathname: path },
    FakeDate
  );
  return attrs;
}

describe("prepaintScript", () => {
  it("marks open and not dismissed inside the window", () => {
    expect(run("2026-12-01T10:00:00Z", null)).toEqual({
      "data-survey-open": "true",
      "data-survey-dismissed": "false",
    });
  });
  it("marks dismissed when the key is set", () => {
    expect(run("2026-12-01T10:00:00Z", "1")["data-survey-dismissed"]).toBe("true");
  });
  it("marks closed before opens and from closes", () => {
    expect(run("2026-11-17T00:00:00Z", null)["data-survey-open"]).toBe("false");
    expect(run("2026-12-13T23:00:00Z", null)["data-survey-open"]).toBe("false");
  });
  it("survives blocked localStorage", () => {
    expect(run("2026-12-01T10:00:00Z", null, true)).toEqual({
      "data-survey-open": "true",
      "data-survey-dismissed": "false",
    });
  });
});

describe("prepaintScript survey state", () => {
  const state = (now: string, throwing = false, path = "/survey", progress = false) =>
    run(now, null, throwing, path, progress)["data-survey-state"];
  it("sets open, resume, nostorage, before and closed", () => {
    const mid = "2026-12-01T10:00:00Z";
    expect(state(mid)).toBe("open");
    expect(state(mid, false, "/survey", true)).toBe("resume");
    expect(state(mid, true)).toBe("nostorage");
    expect(state("2026-11-17T00:00:00Z", true, "/survey", true)).toBe("before");
    expect(state("2026-12-14T00:00:00Z", true, "/survey", true)).toBe("closed");
  });
  it("accepts a trailing slash", () => {
    expect(state("2026-12-01T10:00:00Z", false, "/survey/")).toBe("open");
  });
  it("sets no state off the survey page", () => {
    expect(run("2026-12-01T10:00:00Z", null, false, "/")).not.toHaveProperty("data-survey-state");
    expect(run("2026-12-01T10:00:00Z", null, false, "/surveys")).not.toHaveProperty(
      "data-survey-state"
    );
  });
});

describe("CSP for the inline pre-paint script", () => {
  it("allows inline scripts and keeps the embed framing rules", () => {
    expect(securityHeaders("/")["Content-Security-Policy"]).toMatch(
      /script-src [^;]*'unsafe-inline'/
    );
    expect(securityHeaders("/")["Content-Security-Policy"]).toContain("frame-ancestors 'self'");
    expect(securityHeaders("/embed/x")["Content-Security-Policy"]).toContain("frame-ancestors *");
  });
});
