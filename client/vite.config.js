import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({ fastRefresh: false })],
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()]
    }
  },
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: false,
    cors: true,
    hmr: {
      overlay: false
    }
  },
  preview: {
    port: 5173,
    strictPort: false
  }
})
