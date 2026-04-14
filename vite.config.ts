import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@engine': resolve(__dirname, 'src/engine'),
      '@systems': resolve(__dirname, 'src/systems'),
      '@content': resolve(__dirname, 'src/content'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@platform': resolve(__dirname, 'src/platform'),
    },
  },
  build: {
    outDir: 'dist/web',
  },
});
