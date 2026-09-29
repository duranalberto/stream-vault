import { describe, expect, it } from "vitest";
import { buildShareMessage, gameOf, toHashtag } from "./shareMessages";
import type { CatalogVideo } from "../types/catalog";

const video: CatalogVideo = {
  id: "2026-07-12-16-22-18",
  title: "Mario Kart World - Online - Knockout Tour",
  description: "Gameplay of Mario Kart World. Ended as second place.",
  publishedAt: "2026-07-12",
  tags: ["gameplay", "Mario Kart World", "Online"],
  durationMs: 1000,
  playbackUrl: "https://example.com/a.m3u8",
};

describe("shareMessages", () => {
  it("finds the game and builds hashtags", () => {
    expect(gameOf(video)).toBe("Mario Kart World");
    expect(toHashtag("Mario Kart World")).toBe("MarioKartWorld");
    expect(toHashtag("Splatoon 3")).toBe("Splatoon3");
  });

  it("keeps X posts short with at most two hashtags", () => {
    const m = buildShareMessage("x", { ...video, title: "a ".repeat(300) });
    expect(m.text.length).toBeLessThanOrEqual(200);
    expect(m.hashtags).toEqual(["MarioKartWorld", "Gameplay"]);
  });

  it("uses a plain title for Reddit", () => {
    const m = buildShareMessage("reddit", video);
    expect(m.text).toBe(video.title);
    expect(m.hashtags).toEqual([]);
  });

  it("makes LinkedIn posts humorous and stable per video", () => {
    const a = buildShareMessage("linkedin", video);
    const b = buildShareMessage("linkedin", video);
    expect(a).toEqual(b);
    expect(a.text).toContain("Mario Kart World");
    expect(a.text).toContain(video.title);
    expect(a.hashtags).toContain("Gaming");
  });

  it("caps the native share text at 120 characters", () => {
    const m = buildShareMessage("native", {
      ...video,
      description: "word ".repeat(60).trim(),
    });
    expect(m.text.length).toBeLessThanOrEqual(120);
    expect(m.text.endsWith("…")).toBe(true);
  });
});
