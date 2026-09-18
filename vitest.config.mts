import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      // "server-only" throws outside a React Server Component; in tests it is a no-op
      "server-only": path.resolve(import.meta.dirname, "src/test/server-only-stub.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Each database test file gets its own PGlite instance, so give them room
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
