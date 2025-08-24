import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@/core': '/src/core',
      '@/data': '/src/core/data',
      '@/calculations': '/src/core/calculations',
      '@/utils': '/src/core/utils',
      '@/components': '/src/components',
      '@/pages': '/src/pages',
      '@/store': '/src/store',
    },
  },
})
