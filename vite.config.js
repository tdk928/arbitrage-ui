import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const PUBLIC_AUTH_PATHS = new Set(["/auth/login", "/auth/register"]);

function isProtectedApiPath(pathname) {
  if (pathname.startsWith("/arbitrage")) return true;
  if (!pathname.startsWith("/auth")) return false;
  return !PUBLIC_AUTH_PATHS.has(pathname);
}

function apiBrowserGuard() {
  return {
    name: "api-browser-guard",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url ?? "").split("?")[0];
        const acceptsHtml = req.headers.accept?.includes("text/html");

        if (
          req.method === "GET" &&
          acceptsHtml &&
          isProtectedApiPath(pathname)
        ) {
          res.statusCode = 302;
          res.setHeader("Location", "/access-denied?reason=auth");
          res.end();
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiBrowserGuard()],
  server: {
    // Backend has no CORS middleware, so proxy API calls to it in dev.
    proxy: {
      "/arbitrage": "http://localhost:8000",
      "/auth": "http://localhost:8000",
    },
  },
});
