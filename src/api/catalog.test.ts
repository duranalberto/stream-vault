import { describe, expect, it, vi } from "vitest";
import { CatalogError, parseCatalog, fetchCatalog } from "./catalog";
import rawFixture from "../test/fixtures/catalog.json";

describe("parseCatalog", () => {
  it("parses the real catalog fixture", () => {
    const catalog = parseCatalog(rawFixture);
    expect(catalog.version).toBe(9);
    expect(catalog.videos).toHaveLength(6);
    const first = catalog.videos[0];
    expect(first.id).toBe("2026-07-31-16-51-33");
    expect(first.playbackUrl).toBe(
      "https://d2mcml34hdlt3o.cloudfront.net/videos/2026-07-31-16-51-33/master.m3u8",
    );
    expect(first.tags).toContain("gameplay");
    expect(first.tags).toContain("Splatoon 3");
    expect(first.durationMs).toBe(357_800);
  });

  it("rejects a non-object payload", () => {
    expect(() => parseCatalog([])).toThrow(CatalogError);
    expect(() => parseCatalog("nope")).toThrow(CatalogError);
    expect(() => parseCatalog(null)).toThrow(CatalogError);
  });

  it("rejects a missing videos array", () => {
    expect(() =>
      parseCatalog({ version: 1, updatedAt: "2026-01-01", videos: "no" }),
    ).toThrow(CatalogError);
  });

  it("rejects a video with a missing playbackUrl", () => {
    const bad = {
      version: 1,
      updatedAt: "2026-01-01",
      videos: [
        {
          id: "x",
          title: "t",
          description: "d",
          publishedAt: "2026-01-01",
          tags: [],
          durationMs: 0,
        },
      ],
    };
    expect(() => parseCatalog(bad)).toThrow(/playbackUrl/);
  });

  it("rejects a video with a non-array tags field", () => {
    const bad = {
      version: 1,
      updatedAt: "2026-01-01",
      videos: [
        {
          id: "x",
          title: "t",
          description: "d",
          publishedAt: "2026-01-01",
          tags: "not-an-array",
          durationMs: 0,
          playbackUrl: "https://x/master.m3u8",
        },
      ],
    };
    expect(() => parseCatalog(bad)).toThrow(/tags/);
  });
});

describe("fetchCatalog", () => {
  it("returns the remote catalog when fetch succeeds", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => rawFixture,
    });
    const result = await fetchCatalog();
    expect(result.source).toBe("remote");
    expect(result.videos).toHaveLength(6);
    expect(globalThis.fetch).toHaveBeenCalledOnce();
  });

  it("falls back to the local catalog when the remote fetch fails", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("offline"));
    const result = await fetchCatalog();
    expect(result.source).toBe("local");
    expect(result.videos).toHaveLength(6);
  });

  it("falls back when the remote returns a non-2xx status", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    });
    const result = await fetchCatalog();
    expect(result.source).toBe("local");
    expect(result.videos).toHaveLength(6);
  });
});
