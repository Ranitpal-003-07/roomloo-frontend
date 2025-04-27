import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  assetsInclude: ["**/*.jpg", "**/*.png", "**/*.webp"],
  build: {
    sourcemap: false, // Disables source maps
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    mimeTypes: {
      'js': 'application/javascript'
    }
  },
  
})
