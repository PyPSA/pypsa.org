/** Security headers, repeated in `static/_headers` for assets the Worker never sees. */

const GURUBASE = "https://gurubase.io https://*.gurubase.io";
const MAPBOX = "https://api.tiles.mapbox.com";
const CARTO = "https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com";
const JSDELIVR = "https://cdn.jsdelivr.net";
const BOOTSTRAPCDN = "https://maxcdn.bootstrapcdn.com";
// Gurubase loads highlight.js from here.
const CDNJS = "https://cdnjs.cloudflare.com";

/** True for `/embed` and everything below it, the pages other sites may frame. */
const isEmbed = (pathname: string) => pathname === "/embed" || pathname.startsWith("/embed/");

function csp(embed: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' ${GURUBASE} ${MAPBOX} ${JSDELIVR} ${CDNJS}`,
    `style-src 'self' 'unsafe-inline' ${GURUBASE} ${MAPBOX} ${JSDELIVR} ${BOOTSTRAPCDN} ${CDNJS}`,
    `font-src 'self' data: ${GURUBASE} ${BOOTSTRAPCDN}`,
    `img-src 'self' data: blob: ${GURUBASE} ${CARTO} https://avatars.githubusercontent.com`,
    `connect-src 'self' ${GURUBASE} ${MAPBOX} ${CARTO} ${CDNJS}`,
    `frame-src 'self' https://www.youtube-nocookie.com ${GURUBASE}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    embed ? "frame-ancestors *" : "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/** Header name → value for a response to `pathname`. */
export function securityHeaders(pathname: string): Record<string, string> {
  const embed = isEmbed(pathname);
  return {
    "Content-Security-Policy": csp(embed),
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "Strict-Transport-Security": "max-age=31536000",
    ...(embed ? {} : { "X-Frame-Options": "SAMEORIGIN" }),
  };
}
