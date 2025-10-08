import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    },
  },
  server: {
    proxy: {
      '/data-users': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/data-all': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/search-users': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/pipeline-health': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
