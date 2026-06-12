import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "src/renderer",
  plugins: [react()],
  base: "./",
  server: {
    fs: {
      allow: [path.resolve(__dirname, "src")]
    }
  },
  build: {
    outDir: "../../dist/renderer",
    emptyOutDir: false,
    rollupOptions: {
      input: path.resolve(__dirname, "src/renderer/index.html")
    }
  }
});
