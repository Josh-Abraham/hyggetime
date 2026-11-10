import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Source files use JSX in .js, so treat them as JSX.
export default defineConfig({
  base: '/hyggetime/',
  plugins: [react({ include: /\.(js|jsx)$/ })],
  esbuild: { loader: 'jsx', include: /src\/.*\.js$/, exclude: [] },
  optimizeDeps: { esbuildOptions: { loader: { '.js': 'jsx' } } },
  server: { port: 3000, open: true },
  build: { outDir: 'build' },
});
