import { describe, expect, it } from "vitest";
import type { CatalogVideo } from "../types/catalog";
import {
  filterVideos,
  isGameplay,
  isGameplayTag,
  isOnlineMode,
  matchesGame,
  normalizeTag,
} from "./filter";

function video(overrides: Partial<CatalogVideo> = {}): CatalogVideo {
  return {
    id: "x",
    title: "t",
    description: "d",
    publishedAt: "2026-01-01",
    tags: ["gameplay"],
    durationMs: 1000,
    playbackUrl: "https://example.com/v.m3u8",
    ...overrides,
  };
}

describe("normalizeTag", () => {
  it("trims and lowercases", () => {
    expect(normalizeTag("  Online  ")).toBe("online");
    expect(normalizeTag("SPLATOON 3")).toBe("splatoon 3");
  });
});

describe("isGameplayTag", () => {
  it("matches the gameplay tag case-insensitively, trimmed", () => {
    expect(isGameplayTag("gameplay")).toBe(true);
    expect(isGameplayTag("GAMEPLAY")).toBe(true);
    expect(isGameplayTag("  gameplay ")).toBe(true);
    expect(isGameplayTag("Gameplay+")).toBe(false);
    expect(isGameplayTag("gameplayful")).toBe(false);
  });
});

describe("isGameplay", () => {
  it("is true when any tag is gameplay, false otherwise", () => {
    expect(isGameplay(video({ tags: ["gameplay", "Online"] }))).toBe(true);
    expect(isGameplay(video({ tags: ["GAMEPLAY"] }))).toBe(true);
    expect(isGameplay(video({ tags: ["Online"] }))).toBe(false);
    expect(isGameplay(video({ tags: [] }))).toBe(false);
  });
});

describe("isOnlineMode", () => {
  it("is true when any tag is online (case-insensitive)", () => {
    expect(isOnlineMode(video({ tags: ["Online"] }))).toBe(true);
    expect(isOnlineMode(video({ tags: ["online"] }))).toBe(true);
    expect(isOnlineMode(video({ tags: ["  ONLINE  "] }))).toBe(true);
    expect(isOnlineMode(video({ tags: ["Offline"] }))).toBe(false);
    expect(isOnlineMode(video({ tags: ["gameplay"] }))).toBe(false);
  });
});

describe("matchesGame", () => {
  it("is case-insensitive exact match against a tag", () => {
    const v = video({ tags: ["gameplay", "Splatoon 3"] });
    expect(matchesGame(v, "Splatoon 3")).toBe(true);
    expect(matchesGame(v, "splatoon 3")).toBe(true);
    expect(matchesGame(v, "SPLATOON 3")).toBe(true);
    // exact, so a prefix or a different game does not match
    expect(matchesGame(v, "splatoon")).toBe(false);
    expect(matchesGame(v, "Mario Kart World")).toBe(false);
  });

  it("is false for an empty game (caller must skip that case)", () => {
    expect(matchesGame(video({ tags: ["gameplay"] }), "")).toBe(false);
  });
});

describe("filterVideos", () => {
  const gameplayOnline = video({ id: "gp-on", tags: ["gameplay", "Online", "Splatoon 3"] });
  const gameplayOffline = video({ id: "gp-off", tags: ["gameplay", "Offline"] });
  const notGameplay = video({ id: "notgp", tags: ["Online"] });

  it("always excludes non-gameplay videos, regardless of other filters", () => {
    expect(filterVideos([notGameplay, gameplayOnline], { game: "", mode: "both" })).toEqual([gameplayOnline]);
    expect(filterVideos([notGameplay], { game: "Online", mode: "both" })).toEqual([]);
    expect(filterVideos([notGameplay], { game: "", mode: "online" })).toEqual([]);
  });

  it("keeps all gameplay videos when no filter is active", () => {
    expect(
      filterVideos([gameplayOnline, gameplayOffline], { game: "", mode: "both" }),
    ).toHaveLength(2);
  });

  it("filters by mode: online keeps only online-tagged", () => {
    expect(
      filterVideos([gameplayOnline, gameplayOffline], { game: "", mode: "online" }),
    ).toEqual([gameplayOnline]);
  });

  it("filters by mode: offline keeps only those without an Online tag", () => {
    expect(
      filterVideos([gameplayOnline, gameplayOffline], { game: "", mode: "offline" }),
    ).toEqual([gameplayOffline]);
  });

  it("filters by game (case-insensitive exact)", () => {
    expect(
      filterVideos([gameplayOnline, gameplayOffline], { game: "SPLATOON 3", mode: "both" }),
    ).toEqual([gameplayOnline]);
    expect(
      filterVideos([gameplayOnline], { game: "Mario Kart World", mode: "both" }),
    ).toEqual([]);
  });

  it("combines game and mode with AND", () => {
    const onlineMarioKart = video({ id: "mk-on", tags: ["gameplay", "Online", "Mario Kart World"] });
    const offlineSpark = video({ id: "mk-off", tags: ["gameplay", "Mario Kart World"] });
    const result = filterVideos(
      [onlineMarioKart, offlineSpark],
      { game: "mario kart world", mode: "online" },
    );
    expect(result).toEqual([onlineMarioKart]);
  });

  it("returns an empty array for empty input", () => {
    expect(filterVideos([], { game: "", mode: "both" })).toEqual([]);
  });
});
