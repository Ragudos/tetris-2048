import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

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
      "@input": path.resolve(__dirname, "src/modules/input"),
      "@rendering": path.resolve(__dirname, "src/modules/rendering"),
      "@log": path.resolve(__dirname, "src/modules/log"),
      "@audio": path.resolve(__dirname, "src/modules/audio"),
      "@config": path.resolve(__dirname, "src/modules/config"),
      "@util": path.resolve(__dirname, "src/modules/util"),
    },
  },
});
