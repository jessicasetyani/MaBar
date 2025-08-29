import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from root directory (centralized .env)
  const env = loadEnv(mode, '../', '');

  const frontendPort = parseInt(env.FRONTEND_PORT) || 5173;
  const frontendHost = env.FRONTEND_HOST || '0.0.0.0';
  const backendPort = parseInt(env.BACKEND_PORT) || 5000;
  const backendBaseUrl = env.BACKEND_BASE_URL || 'http://localhost';
  const frontendBaseUrl = env.FRONTEND_BASE_URL || 'http://localhost';

  // Construct full URLs
  const backendUrl = `${backendBaseUrl}:${backendPort}`;
  const frontendUrl = `${frontendBaseUrl}:${frontendPort}`;

  return {
    plugins: [react()],
    server: {
      port: frontendPort,
      host: frontendHost,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false
        },
        '/auth': {
          target: backendUrl,
          changeOrigin: true,
          secure: false
        }
      }
    },
    // Make environment variables available to the frontend
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(backendUrl),
      'import.meta.env.VITE_FRONTEND_URL': JSON.stringify(frontendUrl)
    }
  };
});
