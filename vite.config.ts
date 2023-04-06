import { defineConfig, splitVendorChunkPlugin } from "vite";
import vue from "@vitejs/plugin-vue";
import legacy from "@vitejs/plugin-legacy";
import { fileURLToPath, URL } from "url";

export default defineConfig({
  build: {
    target: "ES2015"
  },
  plugins: [
    vue(),
    splitVendorChunkPlugin(),
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
