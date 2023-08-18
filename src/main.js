import '@arco-design/web-vue/dist/arco.css'
import 'highlight.js/styles/atom-one-dark.css'

import highlight from '@highlightjs/vue-plugin'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'
import { createApp } from 'vue'

import App from './App.vue'
import Cookies from './utils/cookies'
import observer from './utils/observer'
import { useStore } from './utils/store'

hljs.registerLanguage('javascript', javascript)

const app = createApp(App)
const pinia = createPinia()
app.use(highlight)
app.use(pinia)
app.mount('#app')

const store = useStore()

observer(
  '#app > section > main > div.blocklyDiv > div > svg.blocklyFlyout',
  ['style'],
  (element) => {
    const elementWidth = element.getAttribute('width')
    element.style.width = elementWidth + 'px'
    if (element.style.display === 'block') {
      element.style.transform = 'translate(60px,0px)'
    } else {
      const retractedLength = -(Cookies.get('flyout') === 'full' ? elementWidth || 320 : 320) + 60
      element.style.transform = `translate(${retractedLength}px,0px)`
    }
  }
)

observer('#app > section > main > div.blocklyDiv > div > div', ['class'], (element) => {
  store.trashcanOpen = element.classList.contains('blocklyToolboxDelete')
})

if ('serviceWorker' in navigator) {
  registerSW()
}
