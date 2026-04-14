import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@engine': resolve(__dirname, 'src/engine'),
      '@systems': resolve(__dirname, 'src/systems'),
      '@content': resolve(__dirname, 'src/content'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@platform': resolve(__dirname, 'src/platform'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/engine/**', 'src/systems/**', 'src/content/**'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/index.ts'],
    },
  },
});
