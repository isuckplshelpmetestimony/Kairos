
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import { fileURLToPath, URL } from 'node:url';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },
  server: {
    port: 3001,
    open: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  });