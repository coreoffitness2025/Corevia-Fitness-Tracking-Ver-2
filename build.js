// 사용자 정의 빌드 스크립트
import { build } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Vite 사용자 정의 빌드 시작...');

// Vite 빌드 실행
build({
  root: __dirname,
  configFile: resolve(__dirname, 'vite.config.ts'),
})
  .then(() => {
    console.log('빌드 성공');
  })
  .catch((err) => {
    console.error('빌드 오류:', err);
    process.exit(1);
  }); 