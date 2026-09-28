import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import {
  createMemoryRouter,
  RouterProvider,
} from "react-router-dom";
import { Text } from "@chakra-ui/react";

vi.mock("video.js", () => ({
  default: vi.fn(() => ({
    on: () => ({}),
    off: () => ({}),
    dispose: () => undefined,
    error: () => null,
  })),
}));
vi.mock("video.js/dist/video-js.css", () => ({}));
vi.mock("@videojs/http-streaming", () => ({}));

vi.mock("../api/catalog", () => ({
  fetchCatalog: vi.fn(),
}));
import { fetchCatalog } from "../api/catalog";
import type { FetchedCatalog } from "../types/catalog";

import catalogFixture from "../test/fixtures/catalog.json";
import { VideoPage } from "./VideoPage";

const fixtureVideos = (
  catalogFixture as unknown as FetchedCatalog
).videos;

function mockCatalog(mock: Partial<FetchedCatalog>) {
  vi.mocked(fetchCatalog).mockResolvedValue({
    source: mock.source ?? "remote",
    videos: mock.videos ?? [],
  });
}

function mockPending() {
  vi.mocked(fetchCatalog).mockReturnValue(new Promise(() => {}));
}

function renderAt(pathname: string) {
  const router = createMemoryRouter(
    [
      { path: "/", element: <Text>home</Text> },
      { path: "/video/:id", element: <VideoPage /> },
    ],
    { initialEntries: [pathname] },
  );
  return render(
    <ChakraProvider value={defaultSystem}>
      <RouterProvider router={router} />
    </ChakraProvider>,
  );
}

beforeEach(() => {
  vi.mocked(fetchCatalog).mockReset();
});

describe("VideoPage", () => {
  it("renders the video title, description and player for a known id", async () => {
    mockCatalog({ videos: fixtureVideos, source: "remote" });
    const { container } = renderAt("/video/2026-07-31-16-51-33");
    expect(
      await screen.findByRole("heading", { level: 1 }),
    ).toHaveTextContent(/tower control/i);
    expect(screen.getByText(/gameplay of splatoon 3/i)).toBeInTheDocument();
    expect(container.querySelector("video")).not.toBeNull();
    expect(screen.getByText(/published:/i)).toBeInTheDocument();
  });

  it("sets the browser tab title to the video name and restores it on unmount", async () => {
    const baseline = "StreamVault — Video on Demand";
    document.title = baseline;
    mockCatalog({
      videos: [
        {
          id: "2026-07-31-16-51-33",
          title: "Tower Control",
          description: "Annotated tower defense setup.",
          publishedAt: "2026-09-26",
          tags: ["gameplay", "Splatoon 3", "Tower Control"],
          durationMs: 357800,
          playbackUrl: "https://example.com/stream.m3u8",
        },
      ],
      source: "remote",
    });
    const { unmount } = renderAt("/video/2026-07-31-16-51-33");
    await screen.findByRole("heading", { level: 1, name: /tower control/i });

    expect(document.title).toBe("Tower Control");

    unmount();
    expect(document.title).toBe(baseline);
  });

  it("renders duration, tags and back link for a known id", async () => {
    mockCatalog({ videos: fixtureVideos, source: "remote" });
    renderAt("/video/2026-07-31-16-51-33");
    expect(
      await screen.findByText(/duration:\s*5m 58s/i),
    ).toBeInTheDocument();
    expect(await screen.findByText("Splatoon 3")).toBeInTheDocument();
    expect(screen.queryByText("gameplay")).not.toBeInTheDocument();
    const back = await screen.findByRole("link", { name: /back to catalog/i });
    expect(back).toHaveAttribute("href", "/");
  });

  it("shows the loading placeholder before the catalog resolves", async () => {
    mockPending();
    renderAt("/video/2026-07-31-16-51-33");
    const label = await screen.findByTestId("player-loading-label");
    expect(label).toHaveTextContent(/loading video/i);
    expect(document.querySelector("video")).toBeNull();
  });

  it("shows a not-found state with a link home when the id is unknown", async () => {
    mockCatalog({ videos: fixtureVideos, source: "remote" });
    renderAt("/video/does-not-exist");
    expect(
      await screen.findByRole("heading", { level: 1, name: /video not found/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /go to catalog/i }),
    ).toBeInTheDocument();
  });

  it("shows the not-found state when the catalog is empty", async () => {
    mockCatalog({ videos: [], source: "remote" });
    renderAt("/video/2026-07-31-16-51-33");
    expect(
      await screen.findByRole("heading", { level: 1, name: /video not found/i }),
    ).toBeInTheDocument();
  });
});
