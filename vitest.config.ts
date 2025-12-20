import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
  },
  define: {
    __DEV__: true,
    __TEST__: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@log": path.resolve(__dirname, "src/lib/log"),
      "@audio": path.resolve(__dirname, "src/lib/audio"),
      "@config": path.resolve(__dirname, "src/lib/config"),
      "@util": path.resolve(__dirname, "src/lib/util"),
      "@scorer": path.resolve(__dirname, "src/lib/scorer"),
      "@renderer": path.resolve(__dirname, "src/renderer"),
    },
  },
});
