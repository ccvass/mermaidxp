/// <reference types="vitest" />
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'favicon.ico'],
        manifest: {
          name: 'MermaidXP — Diagram Editor',
          short_name: 'MermaidXP',
          description: 'Interactive Mermaid diagram editor with real-time preview',
          theme_color: '#1e40af',
          background_color: '#0f172a',
          display: 'standalone',
          start_url: '/',
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
              handler: 'CacheFirst',
              options: { cacheName: 'cdn-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 } },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    optimizeDeps: {
      exclude: ['firebase', '@firebase/app', '@firebase/auth'],
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      sourcemap: mode === 'development',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-redux', '@reduxjs/toolkit'],
            'firebase-auth': ['firebase/app', 'firebase/auth'],
            'firebase-db': ['firebase/firestore'],
            codemirror: [
              'codemirror',
              '@codemirror/autocomplete',
              '@codemirror/commands',
              '@codemirror/lang-javascript',
              '@codemirror/language',
              '@codemirror/search',
              '@codemirror/state',
              '@codemirror/theme-one-dark',
              '@codemirror/view',
            ],
            pdf: ['jspdf', 'html2canvas', 'canvg'],
          },
        },
      },
    },
    server: {
      port: 3000,
      open: true,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      css: { modules: { classNameStrategy: 'non-scoped' } },
      alias: {
        '@components': path.resolve(__dirname, 'src/components'),
        '@features': path.resolve(__dirname, 'src/features'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@types': path.resolve(__dirname, 'src/types'),
        '@store': path.resolve(__dirname, 'src/store'),
      },
    },
  };
});
