import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Proxy Notion API calls to avoid CORS issues in dev
      '/api/notion': {
        target: 'https://api.notion.com/v1',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/notion/, ''),
      },
      // Proxy Nvidia NIM (Kimi K2.6) API calls to avoid CORS issues in dev
      '/api/nim': {
        target: 'https://integrate.api.nvidia.com/v1',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/nim/, ''),
      },
      // Proxy NewsAPI calls to avoid CORS issues in dev
      '/api/news': {
        target: 'https://newsapi.org',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/news/, ''),
      },
    },
  },
})
