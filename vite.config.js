import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'global': 'window',  // Polyfill global to window for browser environment
    'process.env': {},   // Avoid "process is not defined" issue in browser
  },
  optimizeDeps: {
    include: ['react-quill'],  // Ensure React Quill and draft-js are pre-optimized by Vite
  },
});

