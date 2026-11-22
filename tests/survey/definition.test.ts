import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { waves } from "../../src/lib/survey/wave";

/* eslint-disable @typescript-eslint/no-explicit-any */
const def = waves["2026-h2"];
const fixture = readFileSync(
  new URL("./questionnaire-2026-h2.md", import.meta.url),
  "utf8"
).replace(/\s+/g, " ");

function elementsOf(container: any): any[] {
  const out: any[] = [];
  for (const el of container.elements ?? []) {
    out.push(el);
    if (el.elements) out.push(...elementsOf(el));
  }
  return out;
}
const pages: any[] = def.survey.pages;
const all = pages.flatMap((p) => elementsOf(p));
const byName = (n: string) => all.find((e) => e.name === n);

describe("definition lint", () => {
  it("has unique names across pages, panels and questions", () => {
    const names = [...pages, ...all].map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("only references existing questions in visibleIf", () => {
    const names = new Set(all.map((e) => e.name));
    const withIf = [...pages, ...all].filter((e) => e.visibleIf);
    expect(withIf.length).toBeGreaterThan(0);
    for (const e of withIf) {
      for (const m of e.visibleIf.matchAll(/\{([^}]+)\}/g)) expect(names.has(m[1])).toBe(true);
    }
  });

  it("hides 2.2-2.9 and 3.6.1-3.6.3 from non-users, and shows 1.4 to everyone", () => {
    const cond = "{q1_3} != 'not_used'";
    const hidden = [
      "q2_2",
      "q2_3",
      "q2_4",
      "q2_5",
      "q2_6",
      "q2_7",
      "q2_8",
      "q2_9",
      "q3_6_1",
      "q3_6_2",
      "q3_6_3",
    ];
    for (const n of hidden) expect(byName(n).visibleIf).toContain(cond);
    expect(byName("q3_6_2").visibleIf).toBe(`${cond} and {q3_6_1} notcontains 'no'`);
    expect(byName("q1_4").visibleIf).toBeUndefined();
    expect(byName("q2_1").visibleIf).toBeUndefined();
  });

  it("gives every 3.x row an explanation, kept out of the title", () => {
    let rows = 0;
    for (let i = 1; i <= 6; i++) {
      for (const r of byName(`q3_${i}`).rows) {
        rows++;
        expect(r.description?.length).toBeGreaterThan(10);
        expect(r.text).not.toContain(r.description);
      }
    }
    expect(rows).toBe(38);
  });

  it("offers exactly the 38 grid rows as the 3.7 choices", () => {
    const grid = [1, 2, 3, 4, 5, 6].flatMap((i) =>
      byName(`q3_${i}`).rows.map((r: any) => [r.value, r.text])
    );
    const top = byName("q3_7").choices.map((c: any) => [c.value, c.text]);
    expect(top).toHaveLength(38);
    expect(new Set(top.map((c: any) => c[0])).size).toBe(38);
    expect(top).toEqual(grid);
  });

  it("lists six Part 3 sections that point at existing pages with a rating grid", () => {
    expect(def.sections.map((s) => s.id)).toHaveLength(6);
    for (const [i, s] of def.sections.entries()) {
      const page = pages.find((p) => p.name === s.page);
      expect(page.title).toBe(s.title);
      expect(elementsOf(page).some((e) => e.name === `q3_${i + 1}`)).toBe(true);
    }
  });

  it("sets the survey settings the spec lists", () => {
    expect(def.survey).toMatchObject({
      firstPageIsStartPage: false,
      showQuestionNumbers: "off",
      questionErrorLocation: "bottom",
      completeText: "Submit",
    });
    // The page renders its own section list and progress strip.
    expect(def.survey).not.toHaveProperty("showTOC");
    expect(def.survey).not.toHaveProperty("showProgressBar");
    expect(byName("q3_7").maxSelectedChoices).toBe(3);
    expect(byName("q2_1")).not.toHaveProperty("choicesOrder");
    expect(byName("q2_9")).not.toHaveProperty("rowOrder");
    expect(byName("q1_1").isRequired).toBe(true);
    expect(byName("q1_2").isRequired).toBe(true);
  });
});

describe("3.x rows match the questionnaire as title and explanation pairs", () => {
  const rows = new Set<string>();
  for (const line of readFileSync(
    new URL("./questionnaire-2026-h2.md", import.meta.url),
    "utf8"
  ).split("\n")) {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (line.startsWith("|") && cells.length === 2) rows.add(`${cells[0]}\u0000${cells[1]}`);
  }
  it("has every row as a {text, description} pair in the fixture", () => {
    const bad: string[] = [];
    for (let i = 1; i <= 6; i++)
      for (const r of byName(`q3_${i}`).rows)
        if (!rows.has(`${r.text}\u0000${r.description}`)) bad.push(r.value);
    expect(bad).toEqual([]);
  });
});

describe("definition text matches the questionnaire", () => {
  const strip = (s: string) => s.replace(/(\s*\[[^\]]*\])+\s*$/, "").trim();

  const visible: string[] = [];
  const add = (...s: (string | undefined)[]) => s.forEach((x) => x && visible.push(x));
  const w = def.welcome;
  add(w.title, ...w.intro, w.support, `${w.contactLine} ${def.contact}.`);
  for (const b of w.bullets)
    add(b.map((s: any) => (s.href ? `[${s.text}](${s.href})` : s.text)).join(""));
  add(def.thankYou.text, def.thankYou.shareLabel, def.thankYou.shareUrl, def.thankYou.copyLabel);
  add(def.part3.title, def.part3.intro, def.part3.howItWorks, def.part3.scaleQuestion);
  add(def.nonUser.q2_1Title);
  for (const p of pages) add(p.title, p.description);
  for (const q of all) {
    add(q.title, q.description, q.otherText);
    if (q.name !== "q1_2") for (const c of q.choices ?? []) add(typeof c === "string" ? c : c.text);
    for (const r of q.rows ?? []) add(r.text, r.description);
    for (const c of q.columns ?? []) add(c.title ?? c.text);
  }

  it("contains every visible string of the definition word for word", () => {
    // Strings the questionnaire quotes inside its `>` implementation notes, which the fixture drops.
    const quotedInNotes = ["What would you use PyPSA for?", "Anything missing in this area?"];
    const missing = visible.filter(
      (s) => !quotedInNotes.includes(s) && !fixture.includes(s.replace(/\s+/g, " "))
    );
    expect(missing).toEqual([]);
  });

  it("covers every list item, table cell and question heading of the questionnaire", () => {
    const set = new Set(visible.map((s) => s.replace(/\s+/g, " ")));
    const expected: string[] = [];
    for (const line of readFileSync(
      new URL("./questionnaire-2026-h2.md", import.meta.url),
      "utf8"
    ).split("\n")) {
      let m;
      if (line.startsWith("- ")) expected.push(strip(line.slice(2)));
      else if ((m = line.match(/^#{3,4} (?:\d(?:\.\d)? )?(.+)$/))) {
        if (!["Welcome", "Thank you"].includes(m[1])) expected.push(m[1]);
      } else if ((m = line.match(/^\d\.\d(?:\.\d)? (.+)$/))) expected.push(strip(m[1]));
      else if (line.startsWith("|") && !line.startsWith("|---")) {
        const cells = line
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim());
        if (["Feature", "Feature (release)", "1"].includes(cells[0])) continue;
        expected.push(...cells.filter(Boolean));
      }
    }
    expect(expected.length).toBeGreaterThan(150);
    expect(expected.filter((e) => !set.has(e))).toEqual([]);
  });
});
