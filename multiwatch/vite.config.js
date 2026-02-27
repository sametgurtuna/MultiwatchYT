import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    // Target modern browsers for smaller output
    target: 'es2020',
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vue:       ['vue', 'pinia'],
          draggable: ['vuedraggable'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
