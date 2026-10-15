import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import tailwindcss from "@tailwindcss/vite";
import process from "process";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1";
  const useProxy = mode === "production";
  const proxy = {
    "/api/v1": { target: new URL(apiTarget).origin, changeOrigin: true },
  };

  return {
    plugins: [
      svelte({
        prebundleSvelteLibraries: false,
      }),
      tailwindcss(),
      svelteTesting(),
    ],
    server: {
      port: Number(env.APP_PORT) || 3004,
      proxy,
    },
    preview: {
      port: Number(env.APP_PORT) || 3004,
      proxy,
    },
    build: {
      chunkSizeWarningLimit: 1500,
    },
    define: {
      DELCOM_BASEURL: JSON.stringify(useProxy ? "/api/v1" : apiTarget),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,svelte}"],
        exclude: [
          "src/main.js",
          "src/setupTests.js",
          "src/test-utils.js",
          "**/*.test.{js,jsx}",
          "node_modules/**",
          ".docs/**",
        ],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  };
});