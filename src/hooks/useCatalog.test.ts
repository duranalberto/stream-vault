import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FetchedCatalog } from "../types/catalog";

vi.mock("../api/catalog", () => ({
  fetchCatalog: vi.fn(),
}));

import { fetchCatalog } from "../api/catalog";
import { useCatalog } from "./useCatalog";

const remoteCatalog: FetchedCatalog = {
  source: "remote",
  videos: [
    {
      id: "a",
      title: "A",
      description: "desc A",
      publishedAt: "2026-01-01",
      tags: ["x"],
      durationMs: 1000,
      playbackUrl: "https://x/a.m3u8",
    },
  ],
};

describe("useCatalog", () => {
  it("starts in a loading state with no videos", () => {
    vi.mocked(fetchCatalog).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useCatalog());
    expect(result.current.loading).toBe(true);
    expect(result.current.videos).toEqual([]);
    expect(result.current.source).toBe("local");
    expect(result.current.error).toBeNull();
    expect(result.current.isLocalFallback).toBe(false);
  });

  it("exposes the catalog when the fetch resolves with remote source", async () => {
    vi.mocked(fetchCatalog).mockResolvedValue(remoteCatalog);
    const { result } = renderHook(() => useCatalog());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.videos).toHaveLength(1);
    expect(result.current.source).toBe("remote");
    expect(result.current.isLocalFallback).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("flags the local fallback when the source is local", async () => {
    vi.mocked(fetchCatalog).mockResolvedValue({
      source: "local",
      videos: remoteCatalog.videos,
    });
    const { result } = renderHook(() => useCatalog());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.isLocalFallback).toBe(true);
    expect(result.current.videos).toHaveLength(1);
  });

  it("captures the error message when the fetch rejects", async () => {
    vi.mocked(fetchCatalog).mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useCatalog());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe("boom");
    expect(result.current.videos).toEqual([]);
  });

  it("re-fetches when retry is called after a failure", async () => {
    vi.mocked(fetchCatalog)
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce(remoteCatalog);
    const { result } = renderHook(() => useCatalog());
    await waitFor(() => {
      expect(result.current.error).toBe("boom");
    });
    expect(fetchCatalog).toHaveBeenCalledTimes(1);
    act(() => {
      result.current.retry();
    });
    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });
    expect(fetchCatalog).toHaveBeenCalledTimes(2);
    expect(result.current.videos).toHaveLength(1);
  });

  it("does not update state after unmount", async () => {
    vi.mocked(fetchCatalog).mockResolvedValue(remoteCatalog);
    const { unmount } = renderHook(() => useCatalog());
    unmount();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetchCatalog).toHaveBeenCalledTimes(1);
  });
});
