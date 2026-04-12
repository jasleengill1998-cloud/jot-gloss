import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'bloom-192.png', 'bloom-512.png'],
      manifest: {
        name: 'Jot Gloss \u2014 Study Materials Hub',
        short_name: 'Jot Gloss',
        description: 'A personal hub for interactive study tools, notes, and reference materials.',
        theme_color: '#faf6f0',
        background_color: '#faf6f0',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          { src: 'bloom-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'bloom-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'bloom-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [],
      },
    }),
  ],
})
