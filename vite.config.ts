import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html
            .replace(/%VITE_APP_TITLE%/g, env.VITE_APP_TITLE || 'Admin Template')
            .replace(/%VITE_APP_ICON%/g, env.VITE_APP_ICON || '/favicon.svg')
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
          // 如果需要重写路径，取消下面注释
          // rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
    },
  }
})
