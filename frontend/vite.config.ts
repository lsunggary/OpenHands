/// <reference types="vitest" />
/// <reference types="vite-plugin-svgr/client" />
import { defineConfig, loadEnv } from "vite";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";
import react from "@vitejs/plugin-react";
import { configDefaults } from "vitest/config";

export default defineConfig(({ mode }) => {
  const {
    VITE_BACKEND_HOST = "127.0.0.1:3000",
    VITE_USE_TLS = "false",
    VITE_FRONTEND_PORT = "3001",
    VITE_INSECURE_SKIP_VERIFY = "false",
  } = loadEnv(mode, process.cwd());

  const USE_TLS = VITE_USE_TLS === "true";
  const INSECURE_SKIP_VERIFY = VITE_INSECURE_SKIP_VERIFY === "true";
  const PROTOCOL = USE_TLS ? "https" : "http";
  const WS_PROTOCOL = USE_TLS ? "wss" : "ws";

  const API_URL = `${PROTOCOL}://${VITE_BACKEND_HOST}/`;
  const WS_URL = `${WS_PROTOCOL}://${VITE_BACKEND_HOST}/`;
  const FE_PORT = Number.parseInt(VITE_FRONTEND_PORT, 10);

  return {
    base: '/',
    plugins: [
      !process.env.VITEST && react(),
      viteTsconfigPaths(),
      svgr(),
    ].filter(Boolean),
    server: {
      port: FE_PORT,
      proxy: {
        "/api": {
          target: API_URL,
          changeOrigin: true,
          secure: !INSECURE_SKIP_VERIFY,
        },
        "/ws": {
          target: WS_URL,
          ws: true,
          changeOrigin: true,
          secure: !INSECURE_SKIP_VERIFY,
        },
        "/socket.io": {
          target: WS_URL,
          ws: true,
          changeOrigin: true,
          secure: !INSECURE_SKIP_VERIFY,
          // rewriteWsOrigin: true,
        },
      },
    },
    ssr: {
      noExternal: ["react-syntax-highlighter"],
    },
    clearScreen: false,
    test: {
      environment: "jsdom",
      setupFiles: ["vitest.setup.ts"],
      exclude: [...configDefaults.exclude, "tests"],
      coverage: {
        reporter: ["text", "json", "html", "lcov", "text-summary"],
        reportsDirectory: "coverage",
        include: ["src/**/*.{ts,tsx}"],
      },
    },
    build: {
      modulePreload: { polyfill: true },
      target: 'esnext',
      minify: 'esbuild',
      outDir: 'build',
      rollupOptions: {
        output: {
          format: 'es',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router', 'react-router-dom'],
      esbuildOptions: {
        target: 'esnext'
      }
    },
  };
});
