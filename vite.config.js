import react from "@vitejs/plugin-react";
import {
  defineConfig,
  loadEnv,
} from "vite";

export default defineConfig(
  ({ mode }) => {
    const env =
      loadEnv(
        mode,
        process.cwd(),
        "",
      );

    return {
      plugins: [
        react(),
      ],

      css: {
        modules: {
          localsConvention:
            "camelCaseOnly",
        },
      },

      server: {
        proxy: {
          "/api": {
            target:
              env.DEV_API_PROXY_TARGET ||
              "http://127.0.0.1:5000",

            changeOrigin: true,

            secure: false,
          },
        },
      },

      preview: {
        proxy: {
          "/api": {
            target:
              env.DEV_API_PROXY_TARGET ||
              "http://127.0.0.1:5000",

            changeOrigin: true,

            secure: false,
          },
        },
      },

      build: {
        sourcemap: false,
      },
    };
  },
);