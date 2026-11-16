// Image pipeline: `node scripts/images.mjs avatars [--force] | thumbs | projects | sizes`.
import { readFileSync } from "node:fs";
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join, relative, extname } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const AVATAR_DIR = join(ROOT, "static/img/avatars");
const THUMB_DIR = join(ROOT, "static/img/youtube");
const PROJECT_DIR = join(ROOT, "static/img/projects");
const IMG_DIR = join(ROOT, "static/img");
const MANIFEST = join(ROOT, "src/lib/data/image-sizes.json");
import { avatarIds } from "./avatar-ids.mjs";
const CONCURRENCY = 8;

async function fetchAvatar(id) {
  const url = `https://avatars.githubusercontent.com/u/${id}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (res.status !== 200) return { url, error: `HTTP ${res.status}` };
    const input = Buffer.from(await res.arrayBuffer());
    const out = await sharp(input)
      .resize(240, 240, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();
    writeFileSync(join(AVATAR_DIR, `${id}.webp`), out);
    return null;
  } catch (err) {
    return {
      url,
      error:
        err instanceof Error ? err.cause?.code || err.cause?.message || err.message : String(err),
    };
  }
}

async function avatars(force) {
  const ids = avatarIds();
  mkdirSync(AVATAR_DIR, { recursive: true });

  const stale = readdirSync(AVATAR_DIR).filter(
    (f) => f.endsWith(".webp") && !ids.has(f.slice(0, -5))
  );
  for (const f of stale) unlinkSync(join(AVATAR_DIR, f));
  if (stale.length) console.warn(`Deleted ${stale.length} stale avatars:\n  ${stale.join("\n  ")}`);

  const todo = [...ids].filter((id) => force || !existsSync(join(AVATAR_DIR, `${id}.webp`)));
  const failures = [];
  let next = 0;
  const worker = async () => {
    while (next < todo.length) {
      const failure = await fetchAvatar(todo[next++]);
      if (failure) failures.push(failure);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, todo.length) }, worker));

  console.warn(
    `Avatars: ${ids.size} ids, ${todo.length - failures.length} downloaded, ${ids.size - todo.length} kept.`
  );
  if (failures.length) {
    console.error(`Failed to fetch ${failures.length} avatar(s):`);
    for (const f of failures) console.error(`  ${f.url} (${f.error})`);
    process.exit(1);
  }
}

// YouTube thumbnails, self-hosted so viewing an event page sends nothing to Google.
async function thumbs() {
  const src = readFileSync(join(ROOT, "src/lib/data/events.ts"), "utf8");
  const ids = new Set([...src.matchAll(/videoId: "([\w-]{11})"/g)].map((m) => m[1]));
  mkdirSync(THUMB_DIR, { recursive: true });
  const todo = [...ids].filter((id) => !existsSync(join(THUMB_DIR, `${id}.webp`)));
  const failures = [];
  await Promise.all(
    todo.map(async (id) => {
      const url = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
        if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
        const out = await sharp(Buffer.from(await res.arrayBuffer()))
          .webp({ quality: 80 })
          .toBuffer();
        writeFileSync(join(THUMB_DIR, `${id}.webp`), out);
      } catch (err) {
        failures.push(`${url} (${err instanceof Error ? err.message : err})`);
      }
    })
  );
  console.warn(`Thumbnails: ${ids.size} ids, ${todo.length - failures.length} downloaded.`);
  if (failures.length) {
    console.error(`Failed to fetch ${failures.length} thumbnail(s):\n  ${failures.join("\n  ")}`);
    process.exit(1);
  }
}

async function projects() {
  for (const f of readdirSync(PROJECT_DIR).filter((f) => f.endsWith(".webp"))) {
    const path = join(PROJECT_DIR, f);
    const { width } = await sharp(path).metadata();
    if (!width || width <= 800) continue;
    const out = await sharp(path).resize({ width: 800 }).webp({ quality: 82 }).toBuffer();
    writeFileSync(path, out);
    console.warn(`Resized ${f}: ${width} -> 800 px`);
  }
  await sizes();
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    return e.isDirectory() ? (full === AVATAR_DIR || full === THUMB_DIR ? [] : walk(full)) : [full];
  });
}

async function sizes() {
  const exts = new Set([".webp", ".png", ".jpg", ".jpeg", ".gif", ".avif", ".svg"]);
  const manifest = {};
  for (const file of walk(IMG_DIR)) {
    if (!exts.has(extname(file).toLowerCase())) continue;
    const { width, height } = await sharp(file).metadata();
    manifest["/" + relative(join(ROOT, "static"), file).split("\\").join("/")] = { width, height };
  }
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => (a < b ? -1 : 1)));
  writeFileSync(MANIFEST, JSON.stringify(sorted, null, 2) + "\n");
  console.warn(`Wrote ${Object.keys(sorted).length} entries to src/lib/data/image-sizes.json`);
}

const [cmd, ...flags] = process.argv.slice(2);
if (cmd === "avatars") await avatars(flags.includes("--force"));
else if (cmd === "thumbs") await thumbs();
else if (cmd === "projects") await projects();
else if (cmd === "sizes") await sizes();
else {
  console.error("usage: images.mjs avatars [--force] | thumbs | projects | sizes");
  process.exit(2);
}
