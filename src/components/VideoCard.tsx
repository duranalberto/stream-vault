import {
  Box,
  Flex,
  HStack,
  Heading,
  TagRoot,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import type { CatalogVideo } from "../types/catalog";
import { formatDate, formatDuration } from "../lib/format";
import { isGameplayTag } from "../lib/filter";

export function VideoCard({ video }: { video: CatalogVideo }) {
  const to = `/video/${encodeURIComponent(video.id)}`;
  return (
    <RouterLink to={to} style={{ display: "block" }}>
      <Box
        borderWidth="1px"
        borderColor="border"
        borderRadius="lg"
        p={5}
        display="flex"
        flexDirection="column"
        gap={3}
        h="280px"
        overflow="hidden"
        transition="all 150ms ease-in-out"
        _hover={{
          borderColor: "teal.500",
          boxShadow: "xs",
          bg: "bg.muted/50",
        }}
      >
        <Flex justify="space-between" align="center" gap={2}>
          <Text fontSize="xs" color="fg.muted">
            {formatDate(video.publishedAt)}
          </Text>
          <Text fontSize="xs" color="fg.muted">
            {formatDuration(video.durationMs)}
          </Text>
        </Flex>
        <Heading size="md" as="h3" lineClamp={2}>
          {video.title}
        </Heading>
        <Text fontSize="sm" color="fg.muted" lineClamp={3} flex="1" minH={0}>
          {video.description}
        </Text>
        <HStack wrap="nowrap" gap={2} mt="auto" overflow="hidden">
          {video.tags
            .filter((tag) => !isGameplayTag(tag))
            .slice(0, 4)
            .map((tag) => (
              <TagRoot
                key={tag}
                size="sm"
                variant="subtle"
                colorPalette="teal"
                maxW="100%"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                {tag}
              </TagRoot>
            ))}
        </HStack>
        <Text fontSize="sm" fontWeight="semibold" color="teal.600">
          Watch →
        </Text>
      </Box>
    </RouterLink>
  );
}
