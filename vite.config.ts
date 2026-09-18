import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import checker from 'vite-plugin-checker';
import react from '@vitejs/plugin-react-swc';

// ----------------------------------------------------------------------

const PORT = 3000;

/**
 * Dev-only escape hatch for CORS. The portal sits on the internal network, so
 * the machine running `vite dev` must be on the VPN either way; this proxy
 * only removes the cross-origin problem, not the network one.
 *
 * To use it, set `VITE_API_URL=/api` in `.env`.
 */
const PORTAL_TARGET = process.env.PORTAL_TARGET ?? 'https://staging-portal.datanest.vn';

export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
        dev: { logLevel: ['error'] },
      },
      overlay: {
        position: 'tl',
        initialIsOpen: false,
      },
    }),
  ],
  resolve: {
    alias: {
      src: fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: PORT,
    host: true,
    proxy: {
      '/api': {
        target: PORTAL_TARGET,
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      },
    },
  },
  preview: { port: PORT, host: true },
});
