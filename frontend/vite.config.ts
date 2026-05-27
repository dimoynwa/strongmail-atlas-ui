/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/session': 'http://localhost:8000',
      '/templates': 'http://localhost:8000',
      '/locales': 'http://localhost:8000',
      '/brands': 'http://localhost:8000',
      '/working-copy': 'http://localhost:8000',
      '/preview': 'http://localhost:8000',
      '/tone': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
      '/chat': 'http://localhost:8000',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
