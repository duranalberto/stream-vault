import {
  Box,
  Button,
  Flex,
  HStack,
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

interface ShareTarget {
  label: string;
  shortLabel: string;
  icon: IconType;
  href: (url: string, text: string) => string;
  email?: boolean;
}

const targets: readonly ShareTarget[] = [
  {
    label: "Share on X",
    shortLabel: "X",
    icon: FaXTwitter,
    href: (url, text) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    label: "Share on Facebook",
    shortLabel: "Facebook",
    icon: FaFacebook,
    href: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    label: "Share on LinkedIn",
    shortLabel: "LinkedIn",
    icon: FaLinkedin,
    href: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    label: "Share on Reddit",
    shortLabel: "Reddit",
    icon: FaReddit,
    href: (url, text) =>
      `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  },
  {
    label: "Share on WhatsApp",
    shortLabel: "WhatsApp",
    icon: FaWhatsapp,
    href: (url, text) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`.trim())}`,
  },
  {
    label: "Share by email",
    shortLabel: "Email",
    icon: FaEnvelope,
    email: true,
    href: (url, text) =>
      `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(
        `Watch ${text} at ${url}`,
      )}`,
  },
];

function buildShareText(video: CatalogVideo): string {
  const description = video.description.replace(/\s+/g, " ").trim();
  const suffix = description.length > 0 ? ` — ${description}` : "";
  const full = `${video.title}${suffix}`;
  return full.length > 120 ? `${full.slice(0, 117)}…` : full;
}

export function ShareBar({ video }: { video: CatalogVideo }) {
  const [copyFailed, setCopyFailed] = useState(false);

  const url =
    typeof window !== "undefined" ? window.location.href : "";
  const text = useMemo(() => buildShareText(video), [video]);
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
    <Box
      borderWidth="1px"
      borderColor="border"
      bg="bg.muted/30"
      borderRadius="lg"
      p={5}
    >
      <Stack gap={4}>
        <Text fontWeight="semibold" as="h2">
          Share this video
        </Text>
        <HStack wrap="wrap" gap={2}>
          {targets.map((target) => {
            const Icon = target.icon;
            return (
              <Button
                key={target.label}
                size="sm"
                variant={target.email ? "ghost" : "outline"}
                aria-label={target.label}
                asChild
              >
                <a
                  href={target.href(url, text)}
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
          {canNativeShare && (
            <Button
              size="sm"
              variant="solid"
              colorPalette="teal"
              aria-label="Share with device share sheet"
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
        </HStack>
        <Box as="hr" borderTopWidth="1px" borderColor="border" my={1} />
        <HStack wrap="wrap" gap={3} align="center">
          <Button
            size="sm"
            variant="outline"
            aria-label="Copy video URL"
            onClick={handleCopy}
          >
            <Flex align="center" gap={2}>
              <FaCopy size={14} aria-hidden="true" focusable="false" />
              <Text as="span">Copy video URL</Text>
            </Flex>
          </Button>
          {copyFailed && (
            <Input
              size="sm"
              readOnly
              value={url}
              placeholder="Video URL"
              onFocus={(e) => e.currentTarget.select()}
            />
          )}
        </HStack>
      </Stack>
    </Box>
  );
}
