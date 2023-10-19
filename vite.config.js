import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { VitePWA } from 'vite-plugin-pwa'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    svgr(), 
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Infinity Face Off',
        short_name: 'Face Off',
        description: 'An app for simulating face to face results from Infinity the Game by Corvus Belli.',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'khepri_f2f.svg',
            sizes: '48x48 72x72 96x96 128x128 192x192 256x256 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          },
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => {
              return url.host.startsWith("cdn.jsdelivr.net") || url.host.startsWith("pypi.org") || url.host.startsWith("files.pythonhosted.org");
            },
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "pyodide-cache",
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true
    }})],

  build: {
    sourcemap: true
  }
})

