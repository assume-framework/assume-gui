import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
const apiTarget = process.env.VITE_API_TARGET ?? 'http://localhost:8000';
const grafanaTarget = process.env.GRAFANA_BASE_URL ?? 'http://localhost:3000';
const openaiTarget = process.env.OPENAI_BASE_URL ?? 'http://localhost:11434';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('@xyflow')) return 'xyflow';
          if (id.includes('@mui') || id.includes('@emotion')) return 'mui';
          if (id.includes('react-markdown') || id.includes('remark-')) return 'markdown';
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': apiTarget,
      '/grafana': {
        target: grafanaTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/grafana/, ''),
      },
      '/openai': {
        target: openaiTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/openai/, ''),
      },
    },
  },
})
