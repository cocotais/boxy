import { vitePluginForArco } from '@arco-plugins/vite-vue'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import viteCompression from 'vite-plugin-compression'
import { VitePWA } from 'vite-plugin-pwa'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    vue(),
    vitePluginForArco({ theme: '@arco-themes/vue-boxy', style: true }),
    viteStaticCopy({
      targets: [
        { src: './src/assets/boxy.png', dest: '.', rename: { stripBase: true } },
        { src: './src/assets/favicon.ico', dest: '.', rename: { stripBase: true } },
        { src: './node_modules/blockly/media/*', dest: 'media', rename: { stripBase: true } }
      ]
    }),
    VitePWA({
      mode: 'production',
      base: '/',
      registerType: 'prompt',
      injectRegister: 'auto',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'boxy-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Boxy',
        short_name: 'Boxy',
        description: 'Basic available instance built on Google Blockly.',
        theme_color: '#4062f6',
        start_url: '/',
        id: 'boxy',
        icons: [
          {
            src: 'boxy.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'favicon.ico',
            sizes: '16x16 32x32 48x48 64x64 128x128 256x256',
            type: 'image/x-icon'
          }
        ]
      }
    }),
    viteCompression({
      threshold: 1024 * 1024
    }),
    visualizer()
  ]
})
