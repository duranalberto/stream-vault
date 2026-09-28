export interface CatalogVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  tags: string[];
  durationMs: number;
  playbackUrl: string;
}

export interface Catalog {
  version: number;
  updatedAt: string;
  videos: CatalogVideo[];
}

export type CatalogSource = "remote" | "local";

export interface FetchedCatalog {
  videos: CatalogVideo[];
  source: CatalogSource;
}
