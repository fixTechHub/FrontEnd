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

  // server: {
  //   port: 5174, // Explicitly set frontend port
  //   host: '0.0.0.0', // Allow external connections (needed for ngrok)
  //   allowedHosts: [
  //     'b8d9-2001-ee0-4b7b-3bd0-2d89-bdfa-7310-9e33.ngrok-free.app', // Specific ngrok host
  //     '*.ngrok-free.app', // Wildcard for all ngrok-free.app hosts
  //   ],
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:3000', // Proxy to backend
  //       changeOrigin: true,
  //       secure: false,
  //       ws: true, // Support WebSockets if needed
  //     },
  //     '/socket.io': {
  //       target: 'http://localhost:3000',
  //       changeOrigin: true,
  //       secure: false,
  //       ws: true,
  //     },
  //   },
  // },
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
