import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base doit correspondre au nom du repo GitHub Pages (https://<user>.github.io/MindMapMusical/)
export default defineConfig({
  base: '/MindMapMusical/',
  plugins: [react()],
})
