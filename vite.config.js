import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { PRECACHE_MAX_BYTES } from './scripts/precache.mjs'

// Shown in the menu and About: which build and which army data this is.
// Netlify sets COMMIT_REF; locally, ask git.
const commit = () => {
  if (process.env.COMMIT_REF) return process.env.COMMIT_REF.slice(0, 7)
  try { return execSync('git rev-parse --short HEAD').toString().trim() } catch { return 'dev' }
}
const armyDate = () => {
  try {
    const head = readFileSync(new URL('./src/army/army.json', import.meta.url), 'utf8').slice(0, 300)
    return /"generatedAt"\s*:\s*"([^"]+)"/.exec(head)?.[1]?.slice(0, 10) ?? null
  } catch { return null }
}


// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(commit()),
    __ARMY_DATE__: JSON.stringify(armyDate()),
    // Netlify deploy previews keep the dev tools (src/devTools.js).
    __PREVIEW__: JSON.stringify(['deploy-preview', 'branch-deploy'].includes(process.env.CONTEXT)),
  },
  plugins: [
    react(), 
    svgr(), 
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Infinity the Calculator',
        short_name: 'Infinity Calculator',
        description: 'An app for simulating face to face results from Infinity the Game by Corvus Belli.',
        theme_color: '#121212',
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
        // The army data chunk (~2.7 MB minified) stays precached for offline
        // use; scripts/check-build.mjs fails the build check if it outgrows this.
        maximumFileSizeToCacheInBytes: PRECACHE_MAX_BYTES,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => {
              // Exact hosts: a prefix match would also cache pypi.org.example.com.
              return url.hostname === "pypi.org" || url.hostname === "files.pythonhosted.org" ||
                url.pathname.startsWith("/assets") || url.pathname.startsWith("/pyodide");
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
  },
  // The engine worker is a module worker (src/engine/worker.js).
  worker: {
    format: 'es'
  }
})

