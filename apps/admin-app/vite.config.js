import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // Tắt sourcemap để tránh lỗi Node.js 22
    outDir: 'dist',
    rollupOptions: {
      external: [], // Không external modules
      output: {
        manualChunks: undefined, // Tắt code splitting
        format: 'es' // Sử dụng ES modules
      }
    },
    target: 'es2022' // Target ES2022 cho Node.js 22
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
  }
});