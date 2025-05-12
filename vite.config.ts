import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Config updated for Node 18+ and latest dependencies
export default defineConfig(({ mode }) => {
  // Load env file based on mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '');

  const base = env.VITE_BASE_URL || (mode === 'production' ? '/' : '/');

  return {
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
      minify: true,
      target: 'esnext'
    },
    base: base, // Dynamically set base
    assetsInclude: ['**/*.csv'],
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.env.VITE_BASE_URL': JSON.stringify(base)
    }
  }
});
