import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const sharedAlias = {
  '@engine': resolve(__dirname, 'src/engine'),
  '@systems': resolve(__dirname, 'src/systems'),
  '@content': resolve(__dirname, 'src/content'),
  '@ui': resolve(__dirname, 'src/ui'),
  '@platform': resolve(__dirname, 'src/platform'),
};

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/main',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main.ts'),
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/preload.ts'),
        },
      },
    },
  },
  renderer: {
    plugins: [react()],
    resolve: {
      alias: sharedAlias,
    },
    root: '.',
    build: {
      outDir: 'out/renderer',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html'),
        },
      },
    },
  },
});
