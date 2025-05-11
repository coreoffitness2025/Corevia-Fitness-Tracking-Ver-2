import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

<<<<<<< HEAD
// GitHub Pages와 Vercel 배포를 모두 지원하기 위한 설정
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

=======
>>>>>>> master
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
<<<<<<< HEAD
  // Vercel에서는 루트 경로, GitHub Pages에서는 기존 경로 사용
  base: '/',
  assetsInclude: ['**/*.csv']
});
=======
  base: '/Corevia-Fitness-Tracking-Ver-2/',
  assetsInclude: ['**/*.csv'],
  // GitHub Actions에서 환경 변수를 빌드에 주입하기 위한 설정
  define: {
    'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(process.env.VITE_FIREBASE_API_KEY),
    'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.VITE_FIREBASE_AUTH_DOMAIN),
    'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID),
    'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.VITE_FIREBASE_STORAGE_BUCKET),
    'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(process.env.VITE_FIREBASE_APP_ID),
    'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify(process.env.VITE_FIREBASE_MEASUREMENT_ID)
  }
}); 
>>>>>>> master
