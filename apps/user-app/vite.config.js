import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    sourcemap: true,
    outDir: 'dist',
  },
  
  server: {
    port: 5174,
    host: true,
    https: true
  },
  
  define: {
    global: 'globalThis',
    'process.env': {},
    // 'process.env.NODE_ENV': JSON.stringify('production'),
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
      'simple-peer',
      // 'browser', 
      'process', 
      'stream-browserify', 
      'crypto-browserify', 
      'buffer',
      'events'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  
  esbuild: {
    target: 'esnext',
    keepNames: true,
  }
});