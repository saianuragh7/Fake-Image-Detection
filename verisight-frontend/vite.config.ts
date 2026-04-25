import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Where the API server lives during local development.
// Override with `VITE_API_PROXY_TARGET=http://localhost:4000 npm run dev`.
const API_PROXY_TARGET = process.env.VITE_API_PROXY_TARGET ?? "http://localhost:8080";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
    proxy: {
      // The frontend calls relative paths like `/api/scans`, `/api/stats`, etc.
      // In dev these are proxied to your backend so cookies / multipart uploads
      // work without any CORS setup.
      "/api": {
        target: API_PROXY_TARGET,
        changeOrigin: true,
      },
    },
  },
  preview: {
    allowedHosts: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          radix: [
            "@radix-ui/react-slot",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-toast",
            "@radix-ui/react-dialog",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
          ],
          charts: ["recharts", "date-fns"],
          icons: ["lucide-react"],
          motion: ["framer-motion"],
          query: ["@tanstack/react-query", "wouter"],
        },
      },
    },
  },
});
