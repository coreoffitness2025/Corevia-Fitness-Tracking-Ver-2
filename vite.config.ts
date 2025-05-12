import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// 환경에 따른 base 경로 설정
const getBaseUrl = () => {
  // Vercel 환경인 경우 확인
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    return '/';
  }
  // GitHub Pages인 경우
  return '/Corevia-Fitness-Tracking-Ver-2/';
};

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
  base: getBaseUrl(),
  assetsInclude: ['**/*.csv'],
  // Adds an environment flag to handle different environments
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    'process.env.BASE_URL': JSON.stringify(getBaseUrl())
  }
});
