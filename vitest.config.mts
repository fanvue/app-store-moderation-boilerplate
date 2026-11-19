import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@fixtures": fileURLToPath(new URL("./fixtures", import.meta.url)),
      "@db": fileURLToPath(new URL("./db", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // Keep the mock API's call log and edits out of `data/` while testing.
    env: { MOCK_API_STATE_DIR: path.join(tmpdir(), `mock-api-test-${process.pid}`) },
    include: ["src/**/*.test.ts"],
  },
});
