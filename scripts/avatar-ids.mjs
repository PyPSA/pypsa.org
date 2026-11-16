// GitHub avatar ids referenced by the data files.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const AVATAR_SOURCES = ["src/lib/data/contributors.ts", "src/lib/data/events.ts"];
const AVATAR_RE = /https:\/\/avatars\.githubusercontent\.com\/u\/(\d+)/g;

export function avatarIds(root = process.cwd()) {
  const ids = new Set();
  for (const file of AVATAR_SOURCES) {
    const src = readFileSync(join(root, file), "utf8");
    for (const m of src.matchAll(AVATAR_RE)) ids.add(m[1]);
  }
  return ids;
}
