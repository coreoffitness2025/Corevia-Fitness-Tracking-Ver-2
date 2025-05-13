import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// GitHub Pages와 Vercel 배포를 모두 지원하기 위한 설정
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

// Updated to trigger redeploy
export default defineConfig(({ mode }) => {
  // 모든 환경변수 로드 (NODE_ENV, VITE_ 접두사 등)
  const env = loadEnv(mode, process.cwd(), '');
  
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
      }
    },
    // Vercel에서는 루트 경로, GitHub Pages에서는 저장소 이름 경로 사용
    base: isGitHubPages ? '/Corevia-Fitness-Tracking-Ver-2/' : '/',
    assetsInclude: ['**/*.csv'],
    // GitHub 인증 및 환경변수 디버깅
    define: {
      __APP_ENV__: JSON.stringify(mode),
      __IS_GITHUB_PAGES__: isGitHubPages
    }
  };
});
