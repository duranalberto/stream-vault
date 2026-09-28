import catalogUrl from "../../catalog.json";

export const CDN_ORIGIN = "https://d2mcml34hdlt3o.cloudfront.net";

export const CATALOG_REMOTE_URL = `${CDN_ORIGIN}/catalog/catalog.json`;

/**
 * Rewrite a known-CDN URL to a same-origin path (`/cdn/...`) so the browser
 * never makes a cross-origin request to the CDN. This only happens in dev
 * (`server.proxy`) and build preview (`preview.proxy`), where Vite forwards
 * `/cdn/*` back to the CDN.
 *
 * On a host without that proxy (e.g. GitHub Pages) the `/cdn` path would 404
 * and break playback, so in production the URL is returned unchanged and the
 * CloudFront origin is used directly — it answers
 * `Access-Control-Allow-Origin: *` on the catalog and HLS media, so
 * cross-origin fetch and hls.js both work.
 */
export function toSameOrigin(url: string): string {
  if (import.meta.env.DEV || import.meta.env.MODE === "preview") {
    try {
      const u = new URL(url);
      return u.origin === CDN_ORIGIN ? `/cdn${u.pathname}${u.search}` : url;
    } catch {
      return url;
    }
  }
  return url;
}

export const CATALOG_LOCAL =
  catalogUrl as unknown as import("../types/catalog").Catalog;
