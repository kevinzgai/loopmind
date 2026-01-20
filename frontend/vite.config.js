import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), basicSsl()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    https: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true
      },
      '/ws-seed-asr': {
        target: 'ws://localhost:3002',
        ws: true,
        changeOrigin: true
      },
      '/ws-asr-stream': {
        target: 'ws://localhost:3002',
        ws: true,
        changeOrigin: true
      },
      '/ws-tts-stream': {
        target: 'ws://localhost:3002',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
