import { Link as RouterLink } from "react-router-dom";
import { Heading, Link, Stack, Text } from "@chakra-ui/react";
import { Layout } from "../components/Layout";

export function NotFoundPage() {
  return (
    <Layout>
      <Stack gap={3} py={12} align="center" as="div">
        <Heading size="lg" as="h1">Page not found</Heading>
        <Text color="fg.muted">
          That route does not exist. You can head back to the catalog home.
        </Text>
        <Link
          asChild
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
