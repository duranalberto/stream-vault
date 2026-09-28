import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CDN_ORIGIN, CATALOG_REMOTE_URL, toSameOrigin } from "./constants";

// Under vitest `import.meta.env.DEV` is true (and MODE is "test"), so
// toSameOrigin takes the dev/preview branch and rewrites CDN urls to a
// same-origin /cdn path.
describe("toSameOrigin (dev/preview mode)", () => {
  it("rewrites a CloudFront CDN url to a same-origin /cdn path", () => {
    expect(toSameOrigin(`${CDN_ORIGIN}/catalog/catalog.json`)).toBe(
      "/cdn/catalog/catalog.json",
    );
    expect(toSameOrigin(`${CDN_ORIGIN}/videos/a/b/master.m3u8`)).toBe(
      "/cdn/videos/a/b/master.m3u8",
    );
  });

  it("preserves the query string", () => {
    expect(toSameOrigin(`${CDN_ORIGIN}/v/master.m3u8?x=1`)).toBe(
      "/cdn/v/master.m3u8?x=1",
    );
  });

  it("leaves urls from other origins untouched", () => {
    const other = "https://other.example/videos/master.m3u8";
    expect(toSameOrigin(other)).toBe(other);
  });

  it("leaves invalid urls untouched", () => {
    expect(toSameOrigin("not a url")).toBe("not a url");
  });

  it("matches the remote catalog url", () => {
    expect(toSameOrigin(CATALOG_REMOTE_URL)).toBe("/cdn/catalog/catalog.json");
  });
});

// Simulate a production build (DEV off) where the /cdn proxy is absent and the
// url must be returned unchanged so the CDN origin is used directly.
describe("toSameOrigin (production mode)", () => {
  beforeEach(() => {
    vi.stubEnv("DEV", false);
    vi.stubEnv("MODE", "test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("leaves CDN urls unchanged", () => {
    expect(toSameOrigin(`${CDN_ORIGIN}/catalog/catalog.json`)).toBe(
      `${CDN_ORIGIN}/catalog/catalog.json`,
    );
    expect(toSameOrigin(`${CDN_ORIGIN}/videos/a/b/master.m3u8?x=1`)).toBe(
      `${CDN_ORIGIN}/videos/a/b/master.m3u8?x=1`,
    );
    expect(toSameOrigin(CATALOG_REMOTE_URL)).toBe(CATALOG_REMOTE_URL);
  });

  it("still leaves urls from other origins untouched", () => {
    const other = "https://other.example/videos/master.m3u8";
    expect(toSameOrigin(other)).toBe(other);
  });
});
