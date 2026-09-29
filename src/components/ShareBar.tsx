import {
  Button,
  Flex,
  SimpleGrid,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  FaCopy,
  FaEnvelope,
  FaFacebook,
  FaLinkedin,
  FaReddit,
  FaShareFromSquare,
  FaWhatsapp,
  FaXTwitter,
} from "react-icons/fa6";
import type { CatalogVideo } from "../types/catalog";
import { toastStore } from "../lib/toastStore";
import { buildShareMessage } from "../lib/shareMessages";

interface ShareTarget {
  label: string;
  shortLabel: string;
  icon: IconType;
  href: (url: string, video: CatalogVideo) => string;
  email?: boolean;
}

const enc = encodeURIComponent;

const targets: readonly ShareTarget[] = [
  {
    label: "Share on X",
    shortLabel: "X",
    icon: FaXTwitter,
    href: (url, video) => {
      const m = buildShareMessage("x", video);
      return `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(m.text)}&hashtags=${enc(m.hashtags.join(","))}`;
    },
  },
  {
    label: "Share on Facebook",
    shortLabel: "Facebook",
    icon: FaFacebook,
    href: (url, video) => {
      const m = buildShareMessage("facebook", video);
      const tag = m.hashtags[0] ? `&hashtag=${enc(`#${m.hashtags[0]}`)}` : "";
      return `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}${tag}`;
    },
  },
  {
    label: "Share on LinkedIn",
    shortLabel: "LinkedIn",
    icon: FaLinkedin,
    // The feed composer accepts pre-filled text; the share-offsite endpoint
    // ignores it.
    href: (url, video) => {
      const m = buildShareMessage("linkedin", video);
      const tags = m.hashtags.map((h) => `#${h}`).join(" ");
      return `https://www.linkedin.com/feed/?shareActive=true&text=${enc(`${m.text}\n\n${url}\n\n${tags}`)}`;
    },
  },
  {
    label: "Share on Reddit",
    shortLabel: "Reddit",
    icon: FaReddit,
    href: (url, video) =>
      `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(buildShareMessage("reddit", video).text)}`,
  },
  {
    label: "Share on WhatsApp",
    shortLabel: "WhatsApp",
    icon: FaWhatsapp,
    href: (url, video) =>
      `https://api.whatsapp.com/send?text=${enc(`${buildShareMessage("whatsapp", video).text}\n${url}`)}`,
  },
  {
    label: "Share by email",
    shortLabel: "Email",
    icon: FaEnvelope,
    email: true,
    href: (url, video) => {
      const m = buildShareMessage("email", video);
      return `mailto:?subject=${enc(m.subject ?? "")}&body=${enc(`${m.text}\n\n${url}`)}`;
    },
  },
];

export function ShareBar({ video }: { video: CatalogVideo }) {
  const [copyFailed, setCopyFailed] = useState(false);

  const url =
    typeof window !== "undefined" ? window.location.href : "";
  const text = useMemo(() => buildShareMessage("native", video).text, [video]);
  const canNativeShare =
    typeof navigator !== "undefined" && "share" in navigator;

  async function handleCopy() {
    if (!url) {
      return;
    }
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard?.writeText
      ) {
        await navigator.clipboard.writeText(url);
        toastStore.success({
          title: "Link copied to clipboard",
          duration: 2500,
        });
        setCopyFailed(false);
      } else {
        throw new Error("clipboard unavailable");
      }
    } catch {
      setCopyFailed(true);
    }
  }

  async function handleNativeShare() {
    if (!canNativeShare) {
      return;
    }
    try {
      await navigator.share({ title: video.title, text, url });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      toastStore.error({
        title: "Could not open the share sheet",
        duration: 3500,
      });
    }
  }

  return (
      <Stack gap={3}>
        <Text
          as="h2"
          fontSize="sm"
          fontWeight="semibold"
          color="fg.muted"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          Share this video
        </Text>
        <SimpleGrid columns={2} gap={2}>
          {targets.map((target) => {
            const Icon = target.icon;
            return (
              <Button
                key={target.label}
                size="sm"
                w="full"
                justifyContent="flex-start"
                variant="outline"
                aria-label={target.label}
                asChild
              >
                <a
                  href={target.href(url, video)}
                  target={target.email ? undefined : "_blank"}
                  rel={target.email ? undefined : "noreferrer nofollow"}
                >
                  <Flex align="center" gap={2}>
                    <Icon size={14} aria-hidden="true" focusable="false" />
                    <Text as="span">{target.shortLabel}</Text>
                  </Flex>
                </a>
              </Button>
            );
          })}
          <Button
            size="sm"
            w="full"
            justifyContent="flex-start"
            variant="outline"
            aria-label="Copy video URL"
            gridColumn="1 / -1"
            onClick={handleCopy}
          >
            <Flex align="center" gap={2}>
              <FaCopy size={14} aria-hidden="true" focusable="false" />
              <Text as="span">Copy video URL</Text>
            </Flex>
          </Button>
          {canNativeShare && (
            <Button
              size="sm"
              w="full"
              justifyContent="flex-start"
              variant="solid"
              colorPalette="teal"
              aria-label="Share with device share sheet"
              gridColumn="1 / -1"
              onClick={handleNativeShare}
            >
              <Flex align="center" gap={2}>
                <FaShareFromSquare
                  size={14}
                  aria-hidden="true"
                  focusable="false"
                />
                <Text as="span">Share…</Text>
              </Flex>
            </Button>
          )}
        </SimpleGrid>
        {copyFailed && (
            <Input
              size="sm"
              readOnly
              value={url}
              placeholder="Video URL"
              onFocus={(e) => e.currentTarget.select()}
            />
        )}
      </Stack>
  );
}
