import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

type HlsProps = Record<string, unknown>;
let lastHlsProps: HlsProps | null = null;
let lastSkinStyle: Record<string, unknown> | null = null;
let playerRenders = 0;
let skinRenders = 0;

vi.mock("@videojs/react/video", () => ({
  VideoPlayer: ({ children }: { children: React.ReactNode }) => {
    playerRenders += 1;
    return <div data-testid="mock-video-player">{children}</div>;
  },
  VideoSkin: ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: Record<string, unknown>;
  }) => {
    skinRenders += 1;
    lastSkinStyle = style ?? null;
    return <div data-testid="mock-video-skin">{children}</div>;
  },
}));

vi.mock("@videojs/react/media/hlsjs-video", () => ({
  HlsJsVideo: (props: HlsProps & { src: string }) => {
    lastHlsProps = props;
    return <video data-testid="mock-hls-video" src={props.src} />;
  },
}));

vi.mock("@videojs/react/video/skin.css", () => ({}));

import { Player, PlayerLoading } from "./Player";

beforeEach(() => {
  lastHlsProps = null;
  lastSkinStyle = null;
  playerRenders = 0;
  skinRenders = 0;
});

function renderPlayer(props: { src?: string; autoPlay?: boolean } = {}) {
  return render(
    <ChakraProvider value={defaultSystem}>
      <Player
        src={props.src ?? "https://x.com/a/master.m3u8"}
        autoPlay={props.autoPlay}
      />
    </ChakraProvider>,
  );
}

describe("Player", () => {
  it("renders the Video.js v10 Default skin (VideoPlayer > VideoSkin)", () => {
    const { container } = renderPlayer();
    expect(container.querySelector("[data-testid='mock-video-player']")).not.toBeNull();
    expect(container.querySelector("[data-testid='mock-video-skin']")).not.toBeNull();
    expect(lastSkinStyle).toMatchObject({ width: "100%", aspectRatio: "16 / 9" });
  });

  it("renders an HLS media element inside the skin", () => {
    const { container } = renderPlayer();
    expect(
      container.querySelector("[data-testid='mock-hls-video']"),
    ).not.toBeNull();
  });

  it("passes the manifest url through to the HLS media element", () => {
    renderPlayer();
    expect(lastHlsProps?.src).toBe("https://x.com/a/master.m3u8");
  });

  it("rewrites a CDN url to a same-origin path for playback", () => {
    renderPlayer({
      src: "https://d2mcml34hdlt3o.cloudfront.net/videos/x/master.m3u8",
    });
    expect(lastHlsProps?.src).toBe("/cdn/videos/x/master.m3u8");
  });

  it("passes autoplay and muted when autoPlay is true", () => {
    renderPlayer({ autoPlay: true });
    expect(lastHlsProps?.autoPlay).toBe(true);
    expect(lastHlsProps?.muted).toBe(true);
  });

  it("does not set autoplay by default and preloads metadata", () => {
    renderPlayer();
    expect(lastHlsProps?.autoPlay).toBeUndefined();
    expect(lastHlsProps?.preload).toBe("metadata");
  });

  it("keeps plays inline", () => {
    renderPlayer();
    expect(lastHlsProps?.playsInline).toBe(true);
  });
});

describe("PlayerLoading", () => {
  it("renders a labeled loading placeholder", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <PlayerLoading label="Preparing stream…" />
      </ChakraProvider>,
    );
    expect(screen.getByTestId("player-loading-label")).toHaveTextContent(
      "Preparing stream…",
    );
  });

  it("falls back to the default label", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <PlayerLoading />
      </ChakraProvider>,
    );
    expect(screen.getByTestId("player-loading-label")).toHaveTextContent(
      /player/i,
    );
  });
});
