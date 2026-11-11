import { referencesPage } from "$lib/server/references";

export function load() {
  return { references: referencesPage(5) };
}
