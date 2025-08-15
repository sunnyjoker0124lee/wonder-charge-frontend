import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        // 先不要加 rewrite：讓 /api/tasks 原樣轉給後端的 /api/tasks
        // 如果你的後端實際路徑是 /tasks（沒有 /api 前綴），再把下一行打開：
        // rewrite: p => p.replace(/^\/api/, '')
      },
    },
  },
})
