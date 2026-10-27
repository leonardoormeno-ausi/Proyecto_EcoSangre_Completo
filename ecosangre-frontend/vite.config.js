import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración de Proxy para unificar canales y evitar bloqueos de red en Linux
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
})
