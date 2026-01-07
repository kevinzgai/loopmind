import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/chat': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/tts': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/voice': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      // WebSocket 代理 - 必须在 /asr 之前
      '/asr/stream': {
        target: 'ws://localhost:3000',
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path
      },
      // HTTP 代理 - 在 WebSocket 之后
      '/asr': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // 明确排除 /asr/stream
        bypass: (req) => {
          if (req.url.startsWith('/asr/stream')) {
            return '/asr/stream'; // 让它走 WebSocket 代理
          }
        }
      },
      '/seed-asr': {
        target: 'ws://localhost:3000',
        ws: true,
        changeOrigin: true
      }
    }
  }
})