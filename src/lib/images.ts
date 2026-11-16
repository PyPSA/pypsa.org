import { base } from "$app/paths";
import sizes from "$lib/data/image-sizes.json";

/** Edge length in px of the avatars built by `scripts/images.mjs`. */
export const AVATAR_SIZE = 240;

/** Intrinsic size of YouTube `mqdefault.jpg` thumbnails. */
export const YOUTUBE_THUMB = { width: 320, height: 180 };

const AVATAR_URL = /^https:\/\/avatars\.githubusercontent\.com\/u\/(\d+)(?:\?.*)?$/;

/** Local build-time WebP for a GitHub avatar URL. */
export function avatarSrc(imageUrl: string): string {
  const id = AVATAR_URL.exec(imageUrl)?.[1];
  if (!id) throw new Error(`Not a GitHub avatar URL: ${imageUrl}`);
  return `${base}/img/avatars/${id}.webp`;
}

/** Intrinsic size of a `/img/...` file, from `image-sizes.json`. */
export function imageSize(path: string): { width: number; height: number } {
  const size = (sizes as Record<string, { width: number; height: number }>)[path];
  if (!size) throw new Error(`No size for ${path}: run npm run images:sizes`);
  return size;
}
