import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

// Config updated to support older Node.js versions
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
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
    },
    // Use more compatible build settings
    minify: 'terser',
    target: 'es2015'
  },
  base: '/Corevia-Fitness-Tracking-Ver-2/',
  assetsInclude: ['**/*.csv'],
  // Use a simpler environment setup
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
