/* ============================================================================
 * YOU DO NOT NEED TO EDIT THIS FILE.
 *
 * It is project configuration.
 * The files you work in are in the README, under "Where to work".
 * ============================================================================ */

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// The mock API's call log and edits go to a new folder on every run, removed
// when the run ends, so one run never reads what another left behind.
const mockApiStateDir = mkdtempSync(path.join(tmpdir(), "mock-api-test-"));
process.once("exit", () => rmSync(mockApiStateDir, { recursive: true, force: true }));

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
    env: { MOCK_API_STATE_DIR: mockApiStateDir },
    include: ["src/**/*.test.ts"],
  },
});
