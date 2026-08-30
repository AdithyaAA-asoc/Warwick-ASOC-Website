import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Standard build config — used for `npm run dev` and `npm run build`.
// Produces a normal multi-file dist/ folder suitable for deploying to
// Netlify, Vercel, GitHub Pages, university hosting, etc.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
})
