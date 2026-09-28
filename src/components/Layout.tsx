import {
  Box,
  Container,
  Flex,
  HStack,
  Heading,
  Link,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import type { ReactNode } from "react";

export function Header() {
  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={10}
      borderBottomWidth="1px"
      borderColor="border"
      py={3}
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--chakra-color-bg) 80%, transparent)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <Container maxW="container.xl">
        <HStack justify="space-between" align="center" gap={4}>
          <RouterLink to="/">
            <Flex align="center" gap={3}>
              <Box
                as="span"
                bg="teal.500"
                color="white"
                borderRadius="md"
                w={10}
                h={10}
                display="grid"
                placeItems="center"
                fontSize="md"
              >
                ▶
              </Box>
              <Flex flexDirection="column" gap={0}>
                <Heading size="md" as="span" letterSpacing="tight">
                  StreamVault
                </Heading>
                <Text fontSize="xs" color="fg.muted" as="span">
                  Enjoy my gameplay, on demand.
                </Text>
              </Flex>
            </Flex>
          </RouterLink>
        </HStack>
      </Container>
    </Box>
  );
}

export function Footer() {
  return (
    <Box
      as="footer"
      borderTopWidth="1px"
      borderColor="border"
      py={6}
      mt={16}
      fontSize="sm"
    >
      <Container maxW="container.xl">
        <HStack
          justify="space-between"
          align="center"
          gap={4}
          direction={{ base: "column", md: "row" }}
          textAlign={{ base: "center", md: "left" }}
        >
          <Text color="fg.muted">
            Developed by{" "}
            <Link
              as="a"
              href="https://albertoduran.com/"
              target="_blank"
              rel="noopener noreferrer"
              color="teal.600"
              fontWeight="semibold"
              _hover={{ color: "teal.700" }}
            >
              Alberto Duran
            </Link>
          </Text>
          <Text color="fg.muted">
            StreamVault · React · Vite · Chakra UI · Video.js (HLS)
          </Text>
        </HStack>
      </Container>
    </Box>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <Box
      minH="100dvh"
      display="flex"
      flexDirection="column"
    >
      <Header />
      <Box flex="1" py={8}>
        <Container maxW="container.xl">
          {children}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
