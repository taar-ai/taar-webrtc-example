import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import pkg from './package.json' assert { type: 'json' } // TypeScript ≥5 / Node ≥18

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@taarai/webrtc-client': path.resolve(__dirname, '/Users/devanshjain/work/taar-ai/taar-webrtc/taarwebrtc/src')
      // 👆 Replace with actual relative path
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
