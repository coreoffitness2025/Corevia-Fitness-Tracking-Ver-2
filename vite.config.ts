import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { writeFileSync, readFileSync } from 'fs';

// Config updated for Node 18+ and latest dependencies
export default defineConfig(({ mode }) => {
  // Load env file based on mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '');
  
  // 배포 환경에 따라 base 경로 설정
  // GitHub Pages의 경우 저장소 이름을 base path로 사용
  // Vercel의 경우 루트 경로('/')를 사용
  const isVercel = process.env.VERCEL === '1' || env.VERCEL === '1';
  const base = isVercel ? '/' : '/Corevia-Fitness-Tracking-Ver-2/';

  console.log(`Environment: ${mode}`);
  console.log(`Base path: ${base}`);
  console.log(`Is Vercel: ${isVercel}`);

  // HTML 변환 플러그인 생성
  const htmlPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          /<script type="module" src="\.\/src\/main\.tsx"><\/script>/,
          `<script type="module" src="${base}src/main.tsx"></script>`
        );
      }
    };
  };

  return {
    plugins: [
      react(),
      htmlPlugin(),
      {
        name: 'postbuild-fix-asset-paths',
        closeBundle: async () => {
          try {
            console.log('Running post-build asset path fix...');
            // 이 부분은 GitHub Actions에서 페이지 배포 시 실행됩니다
            if (mode === 'production') {
              console.log('Applying production specific fixes...');
              
              // dist/index.html 파일 읽기
              try {
                let indexHtml = readFileSync('dist/index.html', 'utf-8');
                
                // 스크립트와 스타일시트 경로를 상대 경로로 수정
                indexHtml = indexHtml.replace(/src="\/assets\//g, `src="./assets/`);
                indexHtml = indexHtml.replace(/href="\/assets\//g, `href="./assets/`);
                
                // 수정된 내용 저장
                writeFileSync('dist/index.html', indexHtml);
                console.log('Successfully updated asset paths in dist/index.html');
              } catch (error) {
                console.error('Error updating dist/index.html:', error);
              }
            }
          } catch (error) {
            console.error('Error in post-build hook:', error);
          }
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
    },
    publicDir: 'public',
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'chart-vendor': ['chart.js', 'react-chartjs-2']
          },
          assetFileNames: 'assets/[name]-[hash].[ext]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js'
        }
      },
      minify: true,
      target: 'esnext',
      // 정적 자산 경로 확인
      assetsDir: 'assets',
      emptyOutDir: true
    },
    base: base, // Dynamically set base
    assetsInclude: ['**/*.csv', '**/*.ico', '**/*.png', '**/*.svg'],
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.env.VITE_BASE_URL': JSON.stringify(base),
      'process.env.VERCEL': JSON.stringify(process.env.VERCEL || env.VERCEL || '0'),
      'import.meta.env.VITE_IS_VERCEL': JSON.stringify(isVercel ? '1' : '0'),
      'import.meta.env.VERCEL': JSON.stringify(process.env.VERCEL || env.VERCEL || '0'),
      'import.meta.env.BASE_URL': JSON.stringify(base)
    }
  }
});
