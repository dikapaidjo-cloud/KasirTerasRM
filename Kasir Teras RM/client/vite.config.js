import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Teras RM POS',
        short_name: 'Teras RM',
        description: 'Aplikasi kasir ringan Teras RM',
        theme_color: '#4b2e1f',
        background_color: '#f8f5ef',
        display: 'fullscreen',
        start_url: '/',
        icons: [
          { src: '/logo.png', sizes: '347x347', type: 'image/png' },
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }
        ]
      },
      workbox: {
        navigateFallback: '/',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: { cacheName: 'teras-rm-api' }
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
