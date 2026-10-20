import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { PRECACHE_MAX_BYTES } from './scripts/precache.mjs'
import { splitNames } from './src/army/localize.js'

// Shown in the menu and About: which build and which army data this is.
// CI sets GITHUB_SHA (.github/workflows/deploy.yml); locally, ask git.
const commit = () => {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7)
  try { return execSync('git rev-parse --short HEAD').toString().trim() } catch { return 'dev' }
}
const armyDate = () => {
  try {
    const head = readFileSync(new URL('./src/army/army.json', import.meta.url), 'utf8').slice(0, 300)
    return /"generatedAt"\s*:\s*"([^"]+)"/.exec(head)?.[1]?.slice(0, 10) ?? null
  } catch { return null }
}

// army.json -> `virtual:army-core` (rules, no names) and
// `virtual:army-names-en`, split at build time (src/army/localize.js) so the
// pipeline keeps writing one English file. Other languages' names files are
// written by fetch-army next to it.
const ARMY_JSON = fileURLToPath(new URL('./src/army/army.json', import.meta.url))
const ARMY_MODULES = { 'virtual:army-core': 'core', 'virtual:army-names-en': 'names' }
function armyModules() {
  let split = null
  return {
    name: 'army-modules',
    resolveId: (id) => (id in ARMY_MODULES ? `\0${id}` : null),
    load(id) {
      const part = id.startsWith('\0') ? ARMY_MODULES[id.slice(1)] : null
      if (!part) return null
      this.addWatchFile(ARMY_JSON)
      split ??= splitNames(JSON.parse(readFileSync(ARMY_JSON, 'utf8')))
      // JSON.parse of a string literal parses faster than the same object as JS.
      return `export default JSON.parse(${JSON.stringify(JSON.stringify(split[part]))})`
    },
    watchChange(id) { if (id === ARMY_JSON) split = null },
  }
}

// Per-language chunks get a lang-<what>.<lang> name: the PWA leaves them out
// of the precache (each player caches only their own language, on first use).
const LANG_CHUNKS = [
  [/army-names-en$/, 'lang-names.en'],
  [/names\.([a-z]+)\.json$/, 'lang-names.$1'],
  [/search\/index\.json$/, 'lang-search.en'],
  [/search\/index\.([a-z]+)\.json$/, 'lang-search.$1'],
]
const chunkFileNames = (chunk) => {
  for (const [re, name] of LANG_CHUNKS) {
    const m = re.exec(chunk.facadeModuleId ?? '')
    if (m) return `assets/${m[0].replace(re, name)}-[hash].js`
  }
  if (/army-core$/.test(chunk.facadeModuleId ?? '')) return 'assets/army-core-[hash].js'
  return 'assets/[name]-[hash].js'
}

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(commit()),
    __ARMY_DATE__: JSON.stringify(armyDate()),
    // PR preview builds keep the dev tools (src/devTools.js); deploy.yml sets it.
    __PREVIEW__: JSON.stringify(process.env.PREVIEW === '1'),
  },
  plugins: [
    react(), 
    svgr(), 
    armyModules(),
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
        // The dice engine's .wasm is precached too, so the calculator works offline.
        globPatterns: ['**/*.{js,css,html,svg,png,wasm}'],
        globIgnores: ['**/lang-*'],
        // Unit crests come from the Worker (/crests/*, R2): too many to
        // precache; each is cached the first time it shows (runtimeCaching).
        // The army data chunk (~2.7 MB minified) stays precached for offline
        // use; scripts/check-build.mjs fails the build check if it outgrows this.
        maximumFileSizeToCacheInBytes: PRECACHE_MAX_BYTES,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Names and search index of the player's language (LANG_CHUNKS):
            // hashed file names, so a cached copy never goes stale.
            urlPattern: ({ url }) => url.pathname.startsWith("/assets/lang-"),
            handler: "CacheFirst",
            options: {
              cacheName: "language",
              expiration: { maxEntries: 8 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/crests/"),
            // CB can update a crest under the same name.
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "crests",
              expiration: { maxEntries: 400 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Build assets the precache leaves out (other file types).
            urlPattern: ({ url }) => url.pathname.startsWith("/assets"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "assets",
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
    sourcemap: true,
    rollupOptions: { output: { chunkFileNames } },
  },
  // The engine worker is a module worker (src/engine/worker.js).
  worker: {
    format: 'es'
  }
})

