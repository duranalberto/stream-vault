import type { CatalogVideo } from "../types/catalog";
import { GAMES, normalizeTag } from "./filter";

export type SharePlatform =
  | "x"
  | "facebook"
  | "linkedin"
  | "reddit"
  | "whatsapp"
  | "email"
  | "native";

export interface ShareMessage {
  /** Main body / post text (without the URL unless the platform needs it). */
  text: string;
  /** Hashtags without the leading "#". */
  hashtags: string[];
  /** Subject or title, for platforms that have one. */
  subject?: string;
}

const NOISE_TAGS = new Set(["gameplay", "online", "offline"]);

/** The game this video is about: a known game tag, else the first useful tag. */
export function gameOf(video: CatalogVideo): string | undefined {
  const known = video.tags.find((t) =>
    GAMES.some((g) => normalizeTag(g) === normalizeTag(t)),
  );
  return known ?? video.tags.find((t) => !NOISE_TAGS.has(normalizeTag(t)));
}

/** "Mario Kart World" -> "MarioKartWorld" (valid hashtag). */
export function toHashtag(value: string): string {
  return value
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}

/** Stable per-video pick so a given video always gets the same wording. */
function pick<T>(items: readonly T[], seed: string): T {
  let h = 0;
  for (const ch of seed) {
    h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  }
  return items[h % items.length]!;
}

const LINKEDIN_LINES: readonly ((game: string) => string)[] = [
  (g) =>
    `I'm thrilled to announce that I have been leveraging my core competencies in ${g}. Key learnings: teamwork, resilience, and pressing the right button at the right time.`,
  (g) =>
    `Some people network at conferences. I network with strangers in ${g} lobbies. Here is a data-driven look at my latest performance review.`,
  (g) =>
    `Today I demonstrated cross-functional collaboration, high-pressure decision making and rapid iteration in ${g}. Please excuse the outcome; it was a learning opportunity.`,
];

/** Best-practice, platform-specific copy for sharing a video. */
export function buildShareMessage(
  platform: SharePlatform,
  video: CatalogVideo,
): ShareMessage {
  const game = gameOf(video);
  const gameTag = game ? toHashtag(game) : "";
  const title = video.title.replace(/\s+/g, " ").trim();
  const description = video.description.replace(/\s+/g, " ").trim();

  switch (platform) {
    case "x":
      // 280 chars total; the URL always counts as 23. Keep it short, punchy,
      // and use at most two hashtags.
      return {
        text: truncate(`🎮 ${title}`, 200),
        hashtags: [gameTag, "Gameplay"].filter(Boolean),
      };
    case "facebook":
      // Facebook ignores pre-filled text; only one hashtag is honoured.
      return { text: title, hashtags: gameTag ? [gameTag] : [] };
    case "linkedin": {
      const joke = pick(LINKEDIN_LINES, video.id)(game ?? "gaming");
      return {
        text: `${joke}\n\n🎮 ${title}`,
        hashtags: ["Gaming", "Teamwork", "Leadership"],
      };
    }
    case "reddit":
      // Titles should be descriptive and plain: no emoji, no hashtags.
      return { text: truncate(title, 300), hashtags: [], subject: title };
    case "whatsapp":
      return {
        text: `Check out this ${game ?? "gameplay"} clip 🎮\n${title}`,
        hashtags: [],
      };
    case "email":
      return {
        subject: title,
        text: `Hey! I wanted to share this ${game ?? "gameplay"} video with you.\n\n${title}\n${description}`.trim(),
        hashtags: [],
      };
    case "native":
      return {
        text: truncate(description ? `${title} — ${description}` : title, 120),
        hashtags: [],
        subject: title,
      };
  }
}
