import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/*'],
      manifest: {
        name: 'DayFlow', short_name: 'DayFlow', description: 'Organisez vos journées avec DayFlow.',
        display: 'standalone', start_url: '/', theme_color: '#E9EAF0', background_color: '#E9EAF0',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Ajouter une tâche', short_name: 'Nouvelle tâche', url: '/new', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: "Aujourd'hui", short_name: "Aujourd'hui", url: '/', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: { navigateFallback: '/index.html', globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'] },
    }),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});
