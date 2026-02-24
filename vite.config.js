import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react', 'framer-motion'],
          charts: ['recharts'],
          forms: ['react-hook-form', 'react-hot-toast'],
          utils: ['date-fns', 'axios', '@tanstack/react-query'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true
  }
})