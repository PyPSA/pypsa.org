import { json } from "@sveltejs/kit";
import { allReferences } from "$lib/server/references";

export const prerender = true;

export function GET() {
  return json(allReferences());
}
