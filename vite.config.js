import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Only apply proxy in development
      ...(process.env.NODE_ENV !== 'production' ? {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          secure: false
        }
      } : {})
    }
  }
})

