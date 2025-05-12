import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Config updated for Node 18+ and latest dependencies
export default defineConfig(({ mode }) => {
  // Load env file based on mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '');
  
  // 배포 환경에 따라 base 경로 설정
  // GitHub Pages의 경우 저장소 이름을 base path로 사용
  // Vercel의 경우 루트 경로('/')를 사용
  const isVercel = process.env.VERCEL === '1' || env.VERCEL === '1';
  const base = isVercel ? '/' : (env.VITE_BASE_URL || '/Corevia-Fitness-Tracking-Ver-2/');

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
      'process.env.VITE_BASE_URL': JSON.stringify(base),
      'process.env.VERCEL': JSON.stringify(process.env.VERCEL || env.VERCEL || '0'),
      'import.meta.env.VITE_IS_VERCEL': JSON.stringify(isVercel ? '1' : '0'),
      'import.meta.env.VERCEL': JSON.stringify(process.env.VERCEL || env.VERCEL || '0')
    }
  }
});
