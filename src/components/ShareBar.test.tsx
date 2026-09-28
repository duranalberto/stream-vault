import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ShareBar } from "./ShareBar";
import { AppToaster } from "../lib/toast";
import type { CatalogVideo } from "../types/catalog";

const video: CatalogVideo = {
  id: "2026-07-31-16-51-33",
  title: "Tower Control",
  description:
    "Gameplay of Splatoon 3. Annotated run through the tower control map, showing a defensive setup.",
  publishedAt: "2026-07-31T16:51:33Z",
  tags: ["Splatoon 3", "tower control"],
  durationMs: 358000,
  playbackUrl: "https://example.com/stream.m3u8",
};

function renderShareBar() {
  return render(
    <ChakraProvider value={defaultSystem}>
      <ShareBar video={video} />
      <AppToaster />
    </ChakraProvider>,
  );
}

function decodedHref(el: HTMLElement): string {
  return el.getAttribute("href") ?? "";
}

beforeAll(() => {
  window.history.pushState(null, "", "/video/2026-07-31-16-51-33");
});

beforeEach(() => {
  delete (navigator as { clipboard?: unknown }).clipboard;
  delete (Navigator.prototype as unknown as { share?: unknown }).share;
});

function stubClipboard(writeText: () => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
}

describe("ShareBar", () => {
  it("renders social share links with the video url and title", () => {
    renderShareBar();

    const encodedUrl = encodeURIComponent(
      "http://localhost:3000/video/2026-07-31-16-51-33",
    );
    const text =
      "Tower Control — Gameplay of Splatoon 3. Annotated run through the " +
      "tower control map, showing a defensive setup.";
    const encodedText = encodeURIComponent(text);

    const x = screen.getByRole("link", { name: "Share on X" });
    expect(decodedHref(x)).toContain(`twitter.com/intent/tweet?url=${encodedUrl}`);
    expect(decodedHref(x)).toContain(`text=${encodedText}`);
    expect(x).toHaveAttribute("target", "_blank");
    expect(x).toHaveAttribute("rel", expect.stringContaining("noreferrer"));

    const facebook = screen.getByRole("link", { name: "Share on Facebook" });
    expect(decodedHref(facebook)).toContain(
      `facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    );
    expect(facebook).toHaveAttribute("target", "_blank");

    const linkedin = screen.getByRole("link", { name: "Share on LinkedIn" });
    expect(decodedHref(linkedin)).toContain(
      `linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    );

    const reddit = screen.getByRole("link", { name: "Share on Reddit" });
    expect(decodedHref(reddit)).toContain(
      `reddit.com/submit?url=${encodedUrl}`,
    );
    expect(decodedHref(reddit)).toContain(`title=${encodedText}`);

    const whatsapp = screen.getByRole("link", { name: "Share on WhatsApp" });
    expect(decodedHref(whatsapp)).toBe(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${window.location.href}`.trim())}`,
    );
  });

  it("renders a brand icon next to each social label", () => {
    renderShareBar();

    const x = screen.getByRole("link", { name: "Share on X" });
    expect(x.querySelector("svg")).not.toBeNull();

    const facebook = screen.getByRole("link", { name: "Share on Facebook" });
    expect(facebook.querySelector("svg")).not.toBeNull();
  });

  it("renders a copy icon on the copy button", () => {
    renderShareBar();

    const copy = screen.getByRole("button", { name: "Copy video URL" });
    expect(copy.querySelector("svg")).not.toBeNull();
  });

  it("renders an email share link with the title as subject", () => {
    renderShareBar();
    const email = screen.getByRole("link", { name: "Share by email" });
    expect(decodedHref(email)).toBe(
      `mailto:?subject=${encodeURIComponent(
        "Tower Control — Gameplay of Splatoon 3. Annotated run through the tower control map, showing a defensive setup.",
      )}&body=${encodeURIComponent(
        `Watch Tower Control — Gameplay of Splatoon 3. Annotated run through the tower control map, showing a defensive setup. at ${window.location.href}`,
      )}`,
    );
    expect(email).not.toHaveAttribute("target");
  });

  it("truncates long share text to 120 characters", () => {
    const longVideo: CatalogVideo = {
      ...video,
      description: "word ".repeat(60).trim(),
    };
    render(
      <ChakraProvider value={defaultSystem}>
        <ShareBar video={longVideo} />
        <AppToaster />
      </ChakraProvider>,
    );
    const href = screen
      .getByRole("link", { name: "Share on X" })
      .getAttribute("href") ?? "";
    const text = decodeURIComponent(href.split("text=")[1]);
    expect(text.endsWith("…")).toBe(true);
    expect(text.length).toBeLessThanOrEqual(120);
  });

  it("copies the page url when the clipboard is available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    renderShareBar();

    await userEvent.click(screen.getByRole("button", { name: "Copy video URL" }));

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(await screen.findByText("Link copied to clipboard")).toBeInTheDocument();
  });

  it("shows a manual copy input when the clipboard is unavailable", async () => {
    renderShareBar();

    await userEvent.click(screen.getByRole("button", { name: "Copy video URL" }));

    const input = document.querySelector("input");
    expect(input).not.toBeNull();
    expect((input as HTMLInputElement).value).toBe(window.location.href);
    expect((input as HTMLInputElement).readOnly).toBe(true);
  });

  it("renders a native share button when navigator.share is supported", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    (Navigator.prototype as unknown as { share?: unknown }).share = share;
    renderShareBar();

    await userEvent.click(
      screen.getByRole("button", { name: "Share with device share sheet" }),
    );

    expect(share).toHaveBeenCalledWith({
      title: "Tower Control",
      text: expect.stringContaining("Tower Control"),
      url: window.location.href,
    });
  });

  it("ignores native share dismissal (AbortError)", async () => {
    const share = vi.fn().mockRejectedValue(new DOMException("aborted", "AbortError"));
    (Navigator.prototype as unknown as { share?: unknown }).share = share;
    renderShareBar();

    await userEvent.click(
      screen.getByRole("button", { name: "Share with device share sheet" }),
    );

    expect(share).toHaveBeenCalledOnce();
    expect(screen.queryByText("Could not open the share sheet")).not.toBeInTheDocument();
  });
});
