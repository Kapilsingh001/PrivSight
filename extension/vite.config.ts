import { resolve } from "node:path";
import { defineConfig } from "vite";

/**
 * Three entry points, each emitted with a fixed file name so manifest.json
 * can reference them directly:
 *   popup/popup.html -> dist/popup/popup.html + dist/popup.js
 *   background       -> dist/background.js
 *   content          -> dist/content.js
 *
 * The shared/ modules are type-only, so no runtime chunk is shared between
 * entries and the content script stays a single self-contained file.
 */
export default defineConfig({
  root: "src",
  publicDir: resolve(__dirname, "public"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup/popup.html"),
        background: resolve(__dirname, "src/background/index.ts"),
        content: resolve(__dirname, "src/content/index.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
