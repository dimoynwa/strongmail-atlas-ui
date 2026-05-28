/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss(join(__dirname, 'tailwind.config.js')), autoprefixer()],
    },
  },
  server: {
    open: true,
    proxy: {
      '/session': 'http://localhost:8000',
      '/templates': 'http://localhost:8000',
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
