import { useCallback, useEffect, useState } from "react";
import { fetchCatalog } from "../api/catalog";
import type { CatalogSource, CatalogVideo } from "../types/catalog";

interface CatalogState {
  videos: CatalogVideo[];
  source: CatalogSource;
}

type FetchResult =
  | { status: "ok"; data: CatalogState }
  | { status: "error"; message: string };

interface UseCatalogResult extends CatalogState {
  loading: boolean;
  error: string | null;
  isLocalFallback: boolean;
  retry: () => void;
}

export function useCatalog(): UseCatalogResult {
  const [result, setResult] = useState<FetchResult | undefined>(undefined);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchCatalog()
      .then((catalog) => {
        if (!cancelled) setResult({ status: "ok", data: catalog });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({
            status: "error",
            message: err instanceof Error ? err.message : "Unable to load the catalog",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setResult(undefined);
    setAttempt((a) => a + 1);
  }, []);

  const isError = result?.status === "error";
  const isLoaded = result?.status === "ok";

  return {
    videos: isLoaded ? result.data.videos : [],
    source: isLoaded ? result.data.source : "local",
    loading: result === undefined,
    error: isError ? result.message : null,
    isLocalFallback: isLoaded && result.data.source === "local",
    retry,
  };
}
