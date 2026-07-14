import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['test/**/*.test.{ts,tsx}', 'features/**/*.test.{ts,tsx}', 'app/**/*.test.{ts,tsx}'],
    setupFiles: ['test/setup.ts'],
    css: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
