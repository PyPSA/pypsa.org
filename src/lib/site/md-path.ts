/** Markdown mirror path of a route, dependency-free because the Worker imports it. */
export function mdPathOf(path: string): string {
  const trimmed = path.replace(/\/+$/, "");
  return trimmed === "" ? "/index.md" : `${trimmed}.md`;
}
