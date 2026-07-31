import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@icons': path.resolve(__dirname, 'src/icons/index.jsx'),
      '@ui': path.resolve(__dirname, 'src/ui/index.jsx'),
      '@shell': path.resolve(__dirname, 'src/shell/index.jsx'),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
  },
})
