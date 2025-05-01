import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Updated to trigger redeploy
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  base: '/Corevia-Fitness-Tracking-Ver-2/'
});
