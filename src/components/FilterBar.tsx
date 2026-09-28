import {
  Button,
  ButtonGroup,
  Flex,
  HStack,
  Text,
} from "@chakra-ui/react";
import { GAMES, type VideoMode, type VideoFilters } from "../lib/filter";

interface Option {
  value: string;
  label: string;
}

const MODE_OPTIONS: { value: VideoMode; label: string }[] = [
  { value: "both", label: "Both" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
];

export interface FilterBarProps {
  filters: VideoFilters;
  onChange: (filters: VideoFilters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const gameOptions: Option[] = [
    { value: "", label: "All" },
    ...GAMES.map((name) => ({ value: name, label: name })),
  ];

  const setGame = (game: string) => onChange({ ...filters, game });
  const setMode = (mode: VideoMode) => onChange({ ...filters, mode });

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      gap={4}
      align={{ base: "stretch", md: "center" }}
      justify="space-between"
      wrap="wrap"
    >
      <HStack gap={3} align="center" wrap="wrap">
        <Text fontSize="sm" color="fg.muted" fontWeight="semibold" whiteSpace="nowrap">
          Game
        </Text>
        <ButtonGroup variant="outline" gap={1}>
          {gameOptions.map((opt) => (
            <Button
              key={opt.value || "all"}
              size="sm"
              px={4}
              variant={filters.game === opt.value ? "solid" : "outline"}
              colorPalette={filters.game === opt.value ? "teal" : "gray"}
              aria-pressed={filters.game === opt.value}
              onClick={() => setGame(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </ButtonGroup>
      </HStack>

      <HStack gap={3} align="center" wrap="wrap">
        <Text fontSize="sm" color="fg.muted" fontWeight="semibold" whiteSpace="nowrap">
          Mode
        </Text>
        <ButtonGroup variant="outline" gap={1}>
          {MODE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              px={4}
              variant={filters.mode === opt.value ? "solid" : "outline"}
              colorPalette={filters.mode === opt.value ? "teal" : "gray"}
              aria-pressed={filters.mode === opt.value}
              onClick={() => setMode(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </ButtonGroup>
      </HStack>
    </Flex>
  );
}
