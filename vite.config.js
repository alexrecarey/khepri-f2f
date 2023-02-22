import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { comlink } from 'vite-plugin-comlink'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    comlink(), react(), svgr()
  ],
  worker: {
    plugins: [comlink()]
  }
})
