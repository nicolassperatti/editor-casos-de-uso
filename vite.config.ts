import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // Permite desplegar en GitHub Pages y cualquier subcarpeta sin romper rutas
  plugins: [react()],
})
