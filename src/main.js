import '@arco-design/web-vue/dist/arco.css'
import 'highlight.js/styles/atom-one-dark.css'

import highlight from '@highlightjs/vue-plugin'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
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
    element.style.transform =
      element.style.display === 'block' ? 'translate(60px,0px)' : 'translate(-260px,0px)'
  }
)

observer('#app > section > main > div.blocklyDiv > div > div', ['class'], (element) => {
  store.trashcanOpen = element.classList.contains('blocklyToolboxDelete')
})
