import { vitePluginForArco } from '@arco-plugins/vite-vue'
import vue from '@vitejs/plugin-vue'
import copy from 'rollup-plugin-copy'
import visualizer from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    vue(),
    vitePluginForArco({ style: true }),
    copy({
      targets: [
        { src: './src/assets/favicon.ico', dest: './dist' },
        { src: './node_modules/blockly/media/*', dest: './dist/media' }
      ],
      hook: 'writeBundle'
    }),
    viteCompression({
      threshold: 1024 * 1024
    }),
    visualizer()
  ]
})
