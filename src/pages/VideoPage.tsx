import {
  Box,
  Flex,
  Grid,
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
          p={{ base: 4, md: 6 }}
        >
          <Grid
            templateColumns={{ base: "1fr", md: "minmax(0, 1fr) 20rem" }}
            gap={{ base: 6, md: 8 }}
          >
            <Stack gap={5} minW={0}>
              <Stack gap={2}>
                <Heading size="lg" as="h1">
                  {video.title}
                </Heading>
                <Flex
                  gap={4}
                  flexWrap="wrap"
                  rowGap={1}
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
              <Text color="fg.muted">{video.description}</Text>
              {visibleTags.length > 0 && (
                <HStack wrap="wrap" gap={2}>
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
            </Stack>
            <Box
              borderTopWidth={{ base: "1px", md: "0" }}
              borderLeftWidth={{ base: "0", md: "1px" }}
              borderColor="border"
              pt={{ base: 5, md: 0 }}
              pl={{ base: 0, md: 8 }}
            >
              <ShareBar video={video} />
            </Box>
          </Grid>
        </Box>
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
