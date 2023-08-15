import vue from '@vitejs/plugin-vue'
import copy from 'rollup-plugin-copy'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    copy({
      targets: [
        { src: './src/assets/favicon.ico', dest: './dist' },
        { src: './node_modules/blockly/media/*', dest: './dist/media' }
      ],
      hook: 'writeBundle'
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString()
          }
        }
      }
    }
  }
})
