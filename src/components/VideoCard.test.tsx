import { render, screen } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { VideoCard } from "../components/VideoCard";
import type { CatalogVideo } from "../types/catalog";

const video: CatalogVideo = {
  id: "2026-07-31-16-51-33",
  title: "Splatoon 3 - Tower Control - Sturgeon Shipyard - 2 July 2026",
  description: "Gameplay of Splatoon 3.",
  publishedAt: "2026-09-26",
  tags: [
    "gameplay",
    "Splatoon 3",
    "Tower Control",
    "Online",
    "Rosalina",
    "Daisy",
  ],
  durationMs: 357_800,
  playbackUrl:
    "https://d2mcml34hdlt3o.cloudfront.net/videos/2026-07-31-16-51-33/master.m3u8",
};

function renderCard(props: { video: CatalogVideo }) {
  return render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter>
        <div>
          <VideoCard video={props.video} />
        </div>
      </MemoryRouter>
    </ChakraProvider>,
  );
}

describe("VideoCard", () => {
  it("renders the title, description and duration", () => {
    renderCard({ video });
    expect(
      screen.getByRole("heading", { name: /tower control/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/gameplay of splatoon 3/i)).toBeInTheDocument();
    expect(screen.getByText("5m 58s")).toBeInTheDocument();
  });

  it("links to the watch route using the video id", () => {
    const { container } = renderCard({ video });
    const anchor = container.querySelector("a");
    expect(anchor).not.toBeNull();
    expect(anchor).toHaveAttribute(
      "href",
      "/video/2026-07-31-16-51-33",
    );
  });

  it("hides the gameplay tag and shows up to four other tags", () => {
    renderCard({ video });
    expect(screen.queryByText("gameplay")).not.toBeInTheDocument();
    expect(screen.getByText("Splatoon 3")).toBeInTheDocument();
    expect(screen.getByText("Tower Control")).toBeInTheDocument();
    // 4 non-gameplay tags shown; the 5th is dropped by the slice
    expect(screen.queryByText("Daisy")).not.toBeInTheDocument();
  });
});
