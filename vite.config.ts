import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/sns-competitor-ui/',
  plugins: [react()],
  resolve: {
    alias: { '@': '/src' },
  },
  build: {
    outDir: 'docs',
  },
});
