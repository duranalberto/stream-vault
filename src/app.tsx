import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ChakraProvider, defaultSystem, Flex, Spinner, Text } from "@chakra-ui/react";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AppToaster } from "./lib/toast";

const VideoPage = lazy(() =>
  import("./pages/VideoPage").then((m) => ({ default: m.VideoPage })),
);

function RouteFallback() {
  return (
    <Flex
      minH="60vh"
      width="100%"
      align="center"
      justify="center"
      flexDirection="column"
      gap={3}
    >
      <Spinner size="lg" color="teal.500" />
      <Text color="fg.muted">Loading…</Text>
    </Flex>
  );
}

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  {
    path: "/video/:id",
    element: (
      <Suspense fallback={<RouteFallback />}>
        <VideoPage />
      </Suspense>
    ),
  },
  { path: "*", element: <NotFoundPage /> },
]);

export function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <RouterProvider router={router} />
      <AppToaster />
    </ChakraProvider>
  );
}
