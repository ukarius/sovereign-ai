import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    proxy: {
      // Auth routes → Python FastAPI (port 8000)
      '/api/auth': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      // ML engine routes → Python FastAPI (port 8000)
      '/api/match': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/api/creators': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/api/brands': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/api/analytics': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      // Everything else → Spring Boot (port 8080), rewrite /api → /api/v1
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, '/api/v1'),
      },
      '/ws': {
        target: 'http://127.0.0.1:8080',
        ws: true,
      },
    },
  },
})
