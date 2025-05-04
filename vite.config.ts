import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Updated to trigger redeploy
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'chart-vendor': ['chart.js', 'react-chartjs-2']
        }
      }
    }
  },
  base: '/Corevia-Fitness-Tracking-Ver-2/',
  assetsInclude: ['**/*.csv']
});
