import {
  AlertDescription,
  AlertRoot,
  AlertTitle,
  Button,
  HStack,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { VideoCard } from "../components/VideoCard";
import { FilterBar } from "../components/FilterBar";
import { Hero } from "../components/Hero";
import { Layout } from "../components/Layout";
import { useCatalog } from "../hooks/useCatalog";
import {
  DEFAULT_FILTERS,
  filterVideos,
  hasActiveFilters,
  type VideoFilters,
} from "../lib/filter";

function Home({
  videos,
  filters,
  onFiltersChange,
  loading,
  error,
  retry,
}: {
  videos: ReturnType<typeof useCatalog>["videos"];
  filters: VideoFilters;
  onFiltersChange: (filters: VideoFilters) => void;
  loading: boolean;
  error: string | null;
  retry: () => void;
}) {
  if (loading) {
    return (
      <Stack align="center" justify="center" py={16} minH="40vh">
        <Spinner size="lg" color="teal.500" />
        <Text color="fg.muted">Loading catalog…</Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack gap={4} w="100%">
        <AlertRoot status="warning">
          <AlertTitle>Unable to load the video catalog</AlertTitle>
          <AlertDescription>
            We could not reach the catalog service. You may be offline, or the
            remote service and local fallback both failed. {error}
          </AlertDescription>
        </AlertRoot>
        <HStack>
          <Button onClick={retry} colorPalette="blue">
            Retry
          </Button>
        </HStack>
      </Stack>
    );
  }

  if (videos.length === 0) {
    return (
      <Stack gap={2} py={16}>
        <Text fontWeight="semibold">No videos in the catalog.</Text>
        <Text fontSize="sm" color="fg.muted">
          The catalog is empty right now.
        </Text>
      </Stack>
    );
  }

  const filtered = filterVideos(videos, filters);

  return (
    <Stack gap={5}>
      <Text fontSize="lg" fontWeight="semibold" as="h2">
        {filtered.length} {filtered.length === 1 ? "video" : "videos"} available
      </Text>
      <FilterBar filters={filters} onChange={onFiltersChange} />
      {filtered.length === 0 ? (
        <Stack gap={2} py={12}>
          <Text fontWeight="semibold">No videos match these filters.</Text>
          <Text fontSize="sm" color="fg.muted">
            Try a different game or mode.
          </Text>
          {hasActiveFilters(filters) && (
            <Button size="sm" variant="outline" onClick={() => onFiltersChange(DEFAULT_FILTERS)}>
              Clear filters
            </Button>
          )}
        </Stack>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
          {filtered.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}

export function HomePage() {
  const { videos, loading, error, retry } = useCatalog();
  const [filters, setFilters] = useState<VideoFilters>(DEFAULT_FILTERS);
  const sorted = useMemo(
    () =>
      [...videos].sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      ),
    [videos],
  );
  return (
    <Layout>
      <Stack gap={6}>
        <Hero />
        <Home
          videos={sorted}
          filters={filters}
          onFiltersChange={setFilters}
          loading={loading}
          error={error}
          retry={retry}
        />
      </Stack>
    </Layout>
  );
}
