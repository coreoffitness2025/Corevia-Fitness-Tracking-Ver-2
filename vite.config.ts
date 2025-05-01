import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  base: '/Corevia-Fitness-Tracking-Ver-2/' // 대소문자를 포함하여 정확히 저장소 이름과 일치해야 함
});
