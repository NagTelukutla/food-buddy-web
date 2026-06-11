import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:8080';

  return {
    plugins: [react()],
    test: {
      environment: 'node',
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('@googlemaps')) return 'googlemaps';
            if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('/react/')) {
              return 'react-vendor';
            }
            if (id.includes('axios')) return 'axios';
            return undefined;
          },
        },
      },
    },
    server: {
      port: Number(env.VITE_DEV_PORT) || 5173,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
