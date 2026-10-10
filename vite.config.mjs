import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
    input: {
        popup: resolve(import.meta.dirname, "popup.html"),
        background: resolve(import.meta.dirname, "background.ts"),
        getMultimedias: resolve(import.meta.dirname, "getMultimedias.ts"),
    },

    build: {
        outDir: "dist",
        emptyOutDir: true,
        minify: mode !== "development",
        sourcemap: mode === "development",

        rolldownOptions: {
            output: {
                entryFileNames: "[name].js",
                chunkFileNames: "chunks/[name]-[hash].js",
                assetFileNames: "assets/[name]-[hash][extname]",
            },
        },
    },
}));
