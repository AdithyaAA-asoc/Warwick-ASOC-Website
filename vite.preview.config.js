import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Single-file build — used only to generate a standalone HTML preview
// (everything inlined: JS, CSS, no external file references) for quickly
// sharing/viewing the site without running a dev server. Not used for
// real deployment — use `npm run build` for that.
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  base: './',
  build: {
    outDir: 'dist-preview',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
  },
})
