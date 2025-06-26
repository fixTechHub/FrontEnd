import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext', // Target modern browsers
    sourcemap: true,
    outDir: 'dist'
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis', // Polyfill 'global' for browser compatibility
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true, // Explicitly polyfill process
        }),
        NodeModulesPolyfillPlugin(), // Polyfill Node.js modules like 'stream'
      ],
    },
  },
  define: {
    // 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'), // Ensure NODE_ENV is defined
    global: 'window', // Define global as window for browser
  },
  resolve: {
    alias: {
      process: 'process/browser', // Alias for process
      stream: 'stream-browserify', // Polyfill 'stream' module
      crypto: 'crypto-browserify', // Polyfill 'crypto' if needed
      events: 'events/', // Polyfill 'events' if required
      "@": path.resolve(__dirname, "./src")
    }
  }
});
