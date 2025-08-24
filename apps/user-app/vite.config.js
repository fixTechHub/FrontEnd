import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    sourcemap: true,
    outDir: 'dist'
  },
  
  server: {
    port: 5174,
    host: true, // Allow external access
    https: true, // Set to true if you need HTTPS for WebRTC testing
  },
  
  define: {
    global: 'globalThis',
    'process.env': {},
    // Add NODE_ENV for better debugging
    // 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      events: 'events',
      buffer: 'buffer',
      "@": path.resolve(__dirname, "./src")
    }
  },
  
  optimizeDeps: {
    include: [
      'process', 
      'stream-browserify', 
      'crypto-browserify', 
      'events',
      'buffer',
      'simple-peer'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  
  // Add polyfills for WebRTC compatibility
  esbuild: {
    // Ensure modern JS features are supported
    target: 'esnext',
    // Keep original function names for debugging
    keepNames: true,
  }
});