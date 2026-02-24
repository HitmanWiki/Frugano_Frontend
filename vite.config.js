import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Important for Vercel routing
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild', // Changed from 'terser' to 'esbuild' (built-in, no extra dependency)
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react', 'framer-motion'],
          charts: ['recharts'],
          forms: ['react-hook-form', 'react-hot-toast'],
          utils: ['date-fns', 'axios', '@tanstack/react-query'],
        },
        // Ensure proper asset naming for Vercel cache
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
    // Ensure assets are properly referenced
    assetsDir: 'assets',
    // Generate manifest for better caching
    manifest: true,
  },
  server: {
    port: 5173,
    host: true,
    open: true
  },
  preview: {
    port: 4173,
    host: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@headlessui/react',
      '@heroicons/react',
      'framer-motion',
      'recharts',
      'react-hook-form',
      'react-hot-toast',
      'date-fns',
      'axios',
      '@tanstack/react-query'
    ]
  }
})