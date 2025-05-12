import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Config updated to fix build issues
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
    // Skip typecheck during build for CI environments
    minify: true,
    target: 'es2015'
  },
  base: '/Corevia-Fitness-Tracking-Ver-2/',
  assetsInclude: ['**/*.csv'],
  // Adds an environment flag to handle different environments
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
});
