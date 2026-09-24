import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'render-blocking-entry',
      apply: 'build',
      // Vite recreates the entry tag, dropping its source blocking attribute.
      transformIndexHtml: {
        order: 'post',
        handler: (html) => html.replace(
          /<script type="module"/g,
          '<script type="module" blocking="render"',
        ),
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5176,
  },
})
