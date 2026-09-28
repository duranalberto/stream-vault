import type { Catalog, CatalogVideo, FetchedCatalog } from "../types/catalog";
import { CATALOG_LOCAL, CATALOG_REMOTE_URL, toSameOrigin } from "./constants";

export class CatalogError extends Error {
  override name = "CatalogError";
}

type Raw = unknown;

const isNonEmptyString = (v: Raw): v is string =>
  typeof v === "string" && v.length > 0;

const isStringArray = (v: Raw): v is string[] =>
  Array.isArray(v) && v.every(isNonEmptyString);

const isFiniteNumber = (v: Raw): v is number =>
  typeof v === "number" && Number.isFinite(v);

function assertVideo(value: Raw, index: number): CatalogVideo {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new CatalogError(`catalog.videos[${index}] is not an object`);
  }
  const v = value as Record<string, Raw>;

  if (!isNonEmptyString(v.id)) {
    throw new CatalogError(`catalog.videos[${index}].id is missing`);
  }
  if (
    !isNonEmptyString(v.title) ||
    !isNonEmptyString(v.description) ||
    !isNonEmptyString(v.playbackUrl)
  ) {
    throw new CatalogError(
      `catalog.videos[${index}].title/description/playbackUrl missing`,
    );
  }
  if (typeof v.publishedAt !== "string" || Number.isNaN(Date.parse(v.publishedAt))) {
    throw new CatalogError(`catalog.videos[${index}].publishedAt is missing/invalid`);
  }
  if (!isFiniteNumber(v.durationMs) || v.durationMs < 0) {
    throw new CatalogError(`catalog.videos[${index}].durationMs is missing/invalid`);
  }
  if (!isStringArray(v.tags)) {
    throw new CatalogError(`catalog.videos[${index}].tags is missing/invalid`);
  }

  return {
    id: v.id,
    title: v.title,
    description: v.description,
    publishedAt: v.publishedAt,
    tags: v.tags,
    durationMs: v.durationMs,
    playbackUrl: v.playbackUrl,
  };
}

export function parseCatalog(raw: Raw): Catalog {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new CatalogError("catalog is not an object");
  }
  const c = raw as Record<string, Raw>;

  if (!isFiniteNumber(c.version)) {
    throw new CatalogError("catalog.version is missing/invalid");
  }
  if (typeof c.updatedAt !== "string" || Number.isNaN(Date.parse(c.updatedAt))) {
    throw new CatalogError("catalog.updatedAt is missing/invalid");
  }
  if (!Array.isArray(c.videos)) {
    throw new CatalogError("catalog.videos is not an array");
  }

  return {
    version: c.version,
    updatedAt: c.updatedAt,
    videos: c.videos.map((v, i) => assertVideo(v, i)),
  };
}

async function fetchRemote(timeoutMs = 8000) {
  try {
    const res = await fetch(toSameOrigin(CATALOG_REMOTE_URL), {
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) {
      throw new CatalogError(`remote catalog returned ${res.status}`);
    }
    const raw = (await res.json()) as Raw;
    return { data: parseCatalog(raw), source: "remote" as const };
  } catch (err) {
    if (err instanceof CatalogError) {
      throw err;
    }
    throw new CatalogError(`remote catalog fetch failed: ${(err as Error)?.message ?? err}`);
  }
}

export async function fetchCatalog(): Promise<FetchedCatalog> {
  try {
    const remote = await fetchRemote();
    return { videos: remote.data.videos, source: remote.source };
  } catch {
    const local = parseCatalog(CATALOG_LOCAL);
    return { videos: local.videos, source: "local" };
  }
}
