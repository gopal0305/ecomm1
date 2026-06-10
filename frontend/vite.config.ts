import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
    strictPort: true,
    proxy: {
      // Forward frontend API calls to the Node backend during local dev
      // Example: axios('/api/auth/login') -> http://localhost:8080/api/auth/login
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});


