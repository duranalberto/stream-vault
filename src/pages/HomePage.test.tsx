import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import {
  createMemoryRouter,
  RouterProvider,
  useParams,
} from "react-router-dom";
import { Text } from "@chakra-ui/react";
import { describe, expect, it, vi } from "vitest";
import type { FetchedCatalog } from "../types/catalog";

import catalogFixture from "../test/fixtures/catalog.json";

vi.mock("../api/catalog", () => ({
  fetchCatalog: vi.fn(),
}));
import { fetchCatalog } from "../api/catalog";

import { HomePage } from "./HomePage";

function VideoTarget() {
  const { id } = useParams<{ id: string }>();
  return (
    <Text>
      watching-{id}
    </Text>
  );
}

function renderHome() {
  const router = createMemoryRouter(
    [
      { path: "/", element: <HomePage /> },
      { path: "/video/:id", element: <VideoTarget /> },
    ],
    { initialEntries: ["/"] },
  );
  return render(
    <ChakraProvider value={defaultSystem}>
      <RouterProvider router={router} />
    </ChakraProvider>,
  );
}

describe("HomePage", () => {
  it("renders every catalog video when the remote fetch succeeds", async () => {
    vi.mocked(fetchCatalog).mockResolvedValue({
      source: "remote",
      videos: (catalogFixture as unknown as FetchedCatalog).videos,
    });
    renderHome();
    expect(
      await screen.findAllByRole("heading", { level: 3 }),
    ).toHaveLength(6);
    expect(
      screen.getByText(/mario kart world - online - knockout tour/i),
    ).toBeInTheDocument();
    expect(screen.getByText("6 videos available")).toBeInTheDocument();
  });

  it("shows the local catalog", async () => {
    vi.mocked(fetchCatalog).mockResolvedValue({
      source: "local",
      videos: (catalogFixture as unknown as FetchedCatalog).videos,
    });
    renderHome();
    expect(
      await screen.findAllByRole("heading", { level: 3 }),
    ).toHaveLength(6);
    expect(screen.getByText("6 videos available")).toBeInTheDocument();
  });

  it("navigates to the watch page when a card is clicked", async () => {
    vi.mocked(fetchCatalog).mockResolvedValue({
      source: "remote",
      videos: (catalogFixture as unknown as FetchedCatalog).videos,
    });
    renderHome();
    await screen.findAllByRole("heading", { level: 3 });
    const card = screen.getByRole("link", {
      name: /tower control - sturgeon shipyard/i,
    });
    await userEvent.click(card);
    expect(
      await screen.findByText("watching-2026-07-31-16-51-33"),
    ).toBeInTheDocument();
  });

  it("shows the error alert and a Retry button when both sources fail", async () => {
    vi.mocked(fetchCatalog).mockRejectedValueOnce(
      new Error("remote down, local broken"),
    );
    renderHome();
    expect(
      await screen.findByText(/unable to load the video catalog/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/remote down, local broken/i)).toBeInTheDocument();
    const retry = screen.getByRole("button", { name: /retry/i });
    await userEvent.click(retry);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetchCatalog).toHaveBeenCalledTimes(2);
  });

  it("shows the empty state when the catalog has no videos", async () => {
    vi.mocked(fetchCatalog).mockResolvedValue({
      source: "remote",
      videos: [],
    });
    renderHome();
    expect(
      await screen.findByText(/no videos in the catalog/i),
    ).toBeInTheDocument();
  });

  it("filters the catalog by game", async () => {
    vi.mocked(fetchCatalog).mockResolvedValue({
      source: "remote",
      videos: (catalogFixture as unknown as FetchedCatalog).videos,
    });
    renderHome();
    await screen.findAllByRole("heading", { level: 3 });
    // default shows all 6 gameplay videos
    expect(screen.getByText("6 videos available")).toBeInTheDocument();
    // selecting a game narrows the result set
    await userEvent.click(screen.getByRole("button", { name: "Mario Kart World" }));
    expect(
      await screen.findByText("2 videos available"),
    ).toBeInTheDocument();
  });

  it("shows a no-results state with a clear button when filters match nothing", async () => {
    vi.mocked(fetchCatalog).mockResolvedValue({
      source: "remote",
      videos: (catalogFixture as unknown as FetchedCatalog).videos,
    });
    renderHome();
    await screen.findAllByRole("heading", { level: 3 });
    // the only Mario Tennis Fever video is offline, so Online mode matches none
    await userEvent.click(screen.getByRole("button", { name: "Mario Tennis Fever" }));
    await userEvent.click(screen.getByRole("button", { name: "Online" }));
    expect(
      await screen.findByText(/no videos match these filters/i),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(
      await screen.findByText("6 videos available"),
    ).toBeInTheDocument();
  });
});
