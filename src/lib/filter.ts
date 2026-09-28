import type { CatalogVideo } from "../types/catalog";

export type VideoMode = "both" | "online" | "offline";

export interface VideoFilters {
  game: string;
  mode: VideoMode;
}

export const DEFAULT_FILTERS: VideoFilters = { game: "", mode: "both" };

export const GAMES = [
  "Splatoon 3",
  "Mario Kart World",
  "Mario Tennis Fever",
] as const;

const GAMEPLAY_TAG = "gameplay";
const ONLINE_TAG = "online";

export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

export function isGameplayTag(tag: string): boolean {
  return normalizeTag(tag) === GAMEPLAY_TAG;
}

export function tagsOf(video: CatalogVideo): string[] {
  return video.tags.map(normalizeTag);
}

export function isGameplay(video: CatalogVideo): boolean {
  return video.tags.some(isGameplayTag);
}

export function isOnlineMode(video: CatalogVideo): boolean {
  return video.tags.some((tag) => normalizeTag(tag) === ONLINE_TAG);
}

export function matchesGame(video: CatalogVideo, game: string): boolean {
  const wanted = normalizeTag(game);
  return video.tags.some((tag) => normalizeTag(tag) === wanted);
}

export function filterVideos(
  videos: CatalogVideo[],
  filters: VideoFilters,
): CatalogVideo[] {
  return videos.filter((video) => {
    if (!isGameplay(video)) return false;
    if (filters.game !== "" && !matchesGame(video, filters.game)) return false;
    if (filters.mode === "online" && !isOnlineMode(video)) return false;
    if (filters.mode === "offline" && isOnlineMode(video)) return false;
    return true;
  });
}

export function hasActiveFilters(filters: VideoFilters): boolean {
  return filters.game !== "" || filters.mode !== "both";
}
