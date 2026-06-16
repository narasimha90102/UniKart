import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'logo.png'],
      manifest: {
        name: 'UniKart - University Marketplace',
        short_name: 'UniKart',
        description: 'Buy, sell and connect with students on your campus',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          { src: '/icon-72.png', sizes: '72x72', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-96.png', sizes: '96x96', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-128.png', sizes: '128x128', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-144.png', sizes: '144x144', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-152.png', sizes: '152x152', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-384.png', sizes: '384x384', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^\/api\/.*/,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', networkTimeoutSeconds: 10 },
          },
        ],
      },
    })
  ],
  server: {
    host: true,
    warmup: {
      clientFiles: [
        './src/main.jsx',
        './src/App.jsx',
        './src/pages/auth/Login.jsx',
        './src/pages/auth/Signup.jsx',
        './src/pages/main/Home.jsx',
        './src/pages/main/Marketplace.jsx',
        './src/components/layout/Navbar.jsx',
        './src/components/layout/AppLayout.jsx',
      ]
    },
    proxy: {
      '/socket.io': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        ws: true,
      },
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'lucide-react',
      'axios',
      'socket.io-client',
    ]
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            if (id.includes('socket.io-client') || id.includes('axios')) {
              return 'vendor-utils';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})

