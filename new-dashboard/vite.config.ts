import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite configuration for Betting Dashboard UI
 * - Serves on 0.0.0.0 (accessible via Tailscale, LAN, localhost)
 * - Port 5173 (default)
 * - Smart HMR configuration
 */

export default defineConfig({
  plugins: [react()],
  
  server: {
    host: '0.0.0.0',
    port: 5173,
    
    // HMR auto-detects from browser origin (handles localhost, LAN, Tailscale)
    middlewareMode: false,
    
    cors: {
      origin: '*',
      credentials: false,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      allowedHeaders: ['*'],
      exposedHeaders: ['*'],
    },
  },
  
  build: {
    target: 'ES2020',
    sourcemap: true,
    minify: 'esbuild',
  },
  
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
