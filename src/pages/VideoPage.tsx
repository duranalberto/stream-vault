import {
  Box,
  Flex,
  HStack,
  Heading,
  Link,
  Stack,
  TagRoot,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { FaArrowLeft, FaCalendarDays, FaClock } from "react-icons/fa6";
import { useCatalog } from "../hooks/useCatalog";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { Layout } from "../components/Layout";
import { Player, PlayerLoading } from "../components/Player";
import { ShareBar } from "../components/ShareBar";
import { formatDate, formatDuration } from "../lib/format";
import { isGameplayTag } from "../lib/filter";

export function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const { videos, loading } = useCatalog();

  const video = id ? videos.find((v) => v.id === id) : undefined;
  useDocumentTitle(video?.title ?? null);

  if (id === undefined || id === "") {
    return <MissingVideo reason="no video id in the URL path" />;
  }

  if (loading) {
    return (
      <Layout>
        <Stack gap={4} py={8}>
          <PlayerLoading label="Loading video…" />
        </Stack>
      </Layout>
    );
  }

  if (!video) {
    return <MissingVideo reason={`no video with id “${id}”`} />;
  }

  const visibleTags = video.tags.filter((tag) => !isGameplayTag(tag));

  return (
    <Layout>
      <Stack gap={5}>
        <Link
          asChild
          color="teal.600"
          fontSize="sm"
          _hover={{ color: "teal.700" }}
        >
          <RouterLink to="/">
            <Flex align="center" gap={2}>
              <FaArrowLeft size={14} aria-hidden="true" focusable="false" />
              <Text as="span">Back to catalog</Text>
            </Flex>
          </RouterLink>
        </Link>
        <Player src={video.playbackUrl} />
        <Box
          borderWidth="1px"
          borderColor="border"
          bg="bg.muted/30"
          borderRadius="lg"
          p={5}
        >
          <Stack gap={3}>
            <Heading size="lg" as="h1">
              {video.title}
            </Heading>
            <Text color="fg.muted">
              {video.description}
            </Text>
            <Flex
              gap={4}
              flexWrap="wrap"
              rowGap={2}
              fontSize="sm"
              color="fg.muted"
            >
              <Flex align="center" gap={2}>
                <FaCalendarDays size={14} aria-hidden="true" focusable="false" />
                <Text as="span">
                  Published: {formatDate(video.publishedAt)}
                </Text>
              </Flex>
              <Flex align="center" gap={2}>
                <FaClock size={14} aria-hidden="true" focusable="false" />
                <Text as="span">
                  Duration: {formatDuration(video.durationMs)}
                </Text>
              </Flex>
            </Flex>
          </Stack>
        </Box>
        {visibleTags.length > 0 && (
          <HStack wrap="wrap" gap={3}>
            {visibleTags.map((tag) => (
              <TagRoot
                key={tag}
                size="sm"
                variant="subtle"
                colorPalette="teal"
              >
                {tag}
              </TagRoot>
            ))}
          </HStack>
        )}
        <Box as="hr" borderTopWidth="1px" borderColor="border" mt={2} />
        <ShareBar video={video} />
      </Stack>
    </Layout>
  );
}

function MissingVideo({ reason }: { reason: string }) {
  return (
    <Layout>
      <Stack gap={4} py={12} align="center" as="div">
        <Heading size="md" as="h1">Video not found</Heading>
        <Text color="fg.muted">{reason}.</Text>
        <Link
          asChild
          mt="auto"
          fontWeight="semibold"
          color="teal.600"
          _hover={{ color: "teal.700" }}
        >
          <RouterLink to="/">Go to catalog →</RouterLink>
        </Link>
      </Stack>
    </Layout>
  );
}
