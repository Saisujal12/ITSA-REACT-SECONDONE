import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    css: {
      modules: {
        // `.hero-grid` in a module is used as `styles.heroGrid` in JSX.
        localsConvention: 'camelCaseOnly',
      },
    },
    server: {
      // Proxying /api keeps the admin session cookie (sameSite: lax) first-party
      // in development, whether the site is opened on localhost or 127.0.0.1.
      proxy: {
        '/api': {
          target: env.DEV_API_PROXY_TARGET || 'http://127.0.0.1:5000',
          changeOrigin: true,
        },
      },
    },
    preview: {
      proxy: {
        '/api': {
          target: env.DEV_API_PROXY_TARGET || 'http://127.0.0.1:5000',
          changeOrigin: true,
        },
      },
    },
  }
})
