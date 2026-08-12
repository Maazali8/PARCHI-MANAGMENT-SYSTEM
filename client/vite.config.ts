import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages deploys to: https://<username>.github.io/<repo-name>/
// Set base to the repo name so assets load correctly.
const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [react()],
  base: isProduction ? '/PARCHI-MANAGMENT-SYSTEM/' : '/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
