import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src") } },
  test: {
    exclude: ["**/node_modules/**", "**/.next/**", ...(process.env.RUN_PAYLOAD_INTEGRATION === "1" ? [] : ["**/*.integration.test.ts"])],
  },
});
