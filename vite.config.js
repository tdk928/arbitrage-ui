import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Backend has no CORS middleware, so proxy API calls to it in dev.
    proxy: {
      "/arbitrage": "http://localhost:8000",
    },
  },
});
