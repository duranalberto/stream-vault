/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Proxy the CloudFront CDN through the origin so the browser makes
// same-origin requests to /cdn/* and never depends on the CDN's CORS headers.
const cdnProxy = {
  "/cdn": {
    target: "https://d2mcml34hdlt3o.cloudfront.net",
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/cdn/, ""),
  },
};

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this app as a project site under /stream-vault/.
  base: "/stream-vault/",
  plugins: [react()],
  server: { proxy: cdnProxy },
  preview: { proxy: cdnProxy },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
