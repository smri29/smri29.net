import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          dnd: ['@hello-pangea/dnd'],
          ui: ['lucide-react', 'react-toastify'],
          utils: ['axios', 'react-scroll', 'react-simple-typewriter'],
        },
      },
    },
  },
})
