import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Product name for the shared codebase; each deployment shows its own parish
// name (VITE_PARISH_NAME) wherever the parish, not the app, is meant.
const APP_NAME = 'My Parish'

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Writes the parish name into index.html at build time so the tab title, search
// results and link previews show it without waiting for /api/parish-config.
function parishHtml(parishName: string): Plugin {
  return {
    name: 'parish-html',
    transformIndexHtml: (html) =>
      html
        .replace(/__PARISH_NAME__/g, escapeHtml(parishName))
        .replace(/__APP_NAME__/g, escapeHtml(APP_NAME)),
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [react(), parishHtml(env.VITE_PARISH_NAME?.trim() || APP_NAME)],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  }
})
