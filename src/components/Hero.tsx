import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { FaCopy, FaGamepad } from "react-icons/fa6";
import { toastStore } from "../lib/toastStore";

export const FRIEND_CODE = "SW-1950-8874-9689";

async function copyFriendCode() {
  try {
    await navigator.clipboard.writeText(FRIEND_CODE);
    toastStore.success({ title: "Friend code copied", duration: 2500 });
  } catch {
    toastStore.error({
      title: "Could not copy. Select the code and copy it manually.",
      duration: 3500,
    });
  }
}

export function Hero() {
  return (
    <Flex
      as="section"
      aria-labelledby="hero-title"
      direction={{ base: "column", md: "row" }}
      align={{ base: "stretch", md: "center" }}
      justify="space-between"
      gap={{ base: 5, md: 8 }}
      borderWidth="1px"
      borderColor="border"
      bg="bg.muted/30"
      borderRadius="lg"
      p={{ base: 5, md: 6 }}
    >
      <Stack gap={2} minW={0}>
        <Heading id="hero-title" as="h1" size="xl">
          Welcome to my gameplay vault
        </Heading>
        <Text color="fg.muted" maxW="2xl">
          Grab a seat and take a look at my best matches, close calls and
          questionable decisions. If something catches your eye, send me a
          friend request and let's play together.
        </Text>
      </Stack>
      <Stack
        gap={2}
        flexShrink={0}
        borderLeftWidth={{ base: "0", md: "1px" }}
        borderTopWidth={{ base: "1px", md: "0" }}
        borderColor="border"
        pl={{ base: 0, md: 8 }}
        pt={{ base: 4, md: 0 }}
      >
        <Flex
          align="center"
          gap={2}
          fontSize="sm"
          fontWeight="semibold"
          color="fg.muted"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          <FaGamepad size={14} aria-hidden="true" focusable="false" />
          <Text as="span">My Nintendo friend code</Text>
        </Flex>
        <Flex align="center" gap={3} wrap="wrap">
          <Box
            as="code"
            fontFamily="mono"
            fontSize="lg"
            fontWeight="semibold"
            letterSpacing="wide"
            userSelect="all"
          >
            {FRIEND_CODE}
          </Box>
          <Button
            size="sm"
            variant="outline"
            aria-label="Copy friend code"
            onClick={copyFriendCode}
          >
            <FaCopy size={14} aria-hidden="true" focusable="false" />
            Copy
          </Button>
        </Flex>
      </Stack>
    </Flex>
  );
}
