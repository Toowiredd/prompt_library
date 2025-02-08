/**
 * PWA Configuration
 * Created: 2025-02-08 11:08:42 UTC
 * Author: @toowired
 */

import { VitePWA } from 'npm:vite-plugin-pwa';

export const pwaConfig = {
  registerType: 'autoUpdate',
  manifest: {
    name: "Prompt Library",
    short_name: "PromptLib",
    description: "AI Prompt Management System",
    theme_color: "#2196f3",
    background_color: "#ffffff",
    display: "standalone",
    orientation: "portrait",
    scope: "/",
    start_url: "/",
    icons: [
      {
        src: "icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png"
      },
      {
        src: "icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png"
      },
      {
        src: "icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png"
      },
      {
        src: "icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png"
      },
      {
        src: "icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png"
      },
      {
        src: "icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png"
      },
      {
        src: "icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.val\.town\/v1\/@toowired\/api/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 // 1 hour
          }
        }
      }
    ]
  },
  devOptions: {
    enabled: true,
    type: 'module'
  }
};