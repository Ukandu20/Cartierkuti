import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgrPlugin from "vite-plugin-svgr";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  envPrefix: 'VITE_',
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          if (id.includes("@chakra-ui") || id.includes("@emotion")) return "chakra-vendor";
          if (id.includes("@fortawesome") || id.includes("react-icons")) return "icons-vendor";
          if (id.includes("framer-motion")) return "motion-vendor";
          if (id.includes("swiper")) return "swiper-vendor";
          if (id.includes("axios")) return "api-vendor";
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/@remix-run/router") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "react-vendor";
          }

          return undefined;
        },
      },
    },
  },
  plugins: [
    react(),
    svgrPlugin({
      svgrOptions: {
        icon: true,
      },
    }),
  ],
  server: {
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  optimizeDeps: {
    include: [
      "@chakra-ui/react",
      "@emotion/react",
      "framer-motion",
      "next-themes",
      "react-icons/lu",
    ],
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    globals: true,
    testTimeout: 15000,
    exclude: ['node_modules/**', 'dist/**', 'build/**', 'e2e/**'],
  },
});
