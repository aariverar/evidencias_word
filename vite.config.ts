import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Configuración para GitHub Pages
  base: '/evidencias_word/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
