// Vite: dev server with live reload (`npm run dev`) and a multi-file site build (`npm run build:site`).
// The single-file build used for publishing lives in tools/build/build-single.mjs.
import {defineConfig} from 'vite';

export default defineConfig({
  base: './',            // relative URLs, so dist/site works from any folder or sub-path
  server: {port: 5173, strictPort: false},
  build: {outDir: 'dist/site', emptyOutDir: true, assetsInlineLimit: 0},
});
