import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // Tắt sourcemap để tránh lỗi Node.js 22
    outDir: 'dist',
    target: 'es2022', // Target ES2022 cho Node.js 22
    minify: 'esbuild' // Sử dụng esbuild thay vì rollup
  },
  server: {
    port: 5173
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  optimizeDeps: {
    include: ['axios'] // Force include axios
  },
  define: {
    global: 'globalThis' // Fix global object cho Node.js 22
  }
});