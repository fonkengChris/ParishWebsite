import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

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

// Installable app: manifest + a Workbox service worker that precaches the app
// shell. API calls are never cached, so parish data is always live.
const pwa = VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'logo-mark.svg'],
  manifest: {
    id: '/',
    name: APP_NAME,
    short_name: APP_NAME,
    description: 'Mass times, events, announcements and more from your parish.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#fbf7f0', // ivory
    theme_color: '#fbf7f0',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/logo-mark.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
    navigateFallback: '/index.html',
    navigateFallbackDenylist: [/^\/api\//],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: ({ request, sameOrigin }) => sameOrigin && request.destination === 'image',
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'images', expiration: { maxEntries: 60 } },
      },
    ],
  },
})

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_')
  return {
    plugins: [react(), parishHtml(env.VITE_PARISH_NAME?.trim() || APP_NAME), pwa],
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
