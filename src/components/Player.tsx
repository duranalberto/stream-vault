import "@videojs/react/video/skin.css";
import { VideoPlayer, VideoSkin } from "@videojs/react/video";
import { HlsJsVideo } from "@videojs/react/media/hlsjs-video";
import { Box, Spinner } from "@chakra-ui/react";
import { toSameOrigin } from "../api/constants";

export interface PlayerProps {
  src: string;
  autoPlay?: boolean;
}

// The Video.js v10 skin renders its own rounded frame
// (--media-video-border-radius: 28px default plus a 1px :after border),
// so no Chakra shell is needed around the player; wrapping it in a box with
// its own tighter radius (e.g. borderRadius="lg" = 8px) would clip the skin's
// corners down.
export function Player({ src, autoPlay = false }: PlayerProps) {
  const mediaProps = autoPlay
    ? { autoPlay: true, muted: true }
    : { preload: "metadata" as const };

  return (
    <VideoPlayer>
      <VideoSkin style={{ width: "100%", aspectRatio: "16 / 9" }}>
        <HlsJsVideo src={toSameOrigin(src)} playsInline {...mediaProps} />
      </VideoSkin>
    </VideoPlayer>
  );
}

export function PlayerLoading({ label = "Loading player…" }: { label?: string }) {
  return (
    <Box
      width="100%"
      aspectRatio="16/9"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      gap={3}
      borderWidth="1px"
      borderColor="border"
      borderRadius="28px"
    >
      <Spinner color="teal.500" size="lg" />
      <span data-testid="player-loading-label">{label}</span>
    </Box>
  );
}
