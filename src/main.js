import '@arco-design/web-vue/dist/arco.css'
import 'highlight.js/styles/atom-one-dark.css'

import arco from '@arco-design/web-vue'
import highlight from '@highlightjs/vue-plugin'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import observer from './utils/observer'

hljs.registerLanguage('javascript', javascript)

const app = createApp(App)
const pinia = createPinia()
app.use(arco)
app.use(highlight)
app.use(pinia)
app.mount('#app')

observer(
  '#app > section > main > div.blocklyDiv > div > svg.blocklyFlyout',
  ['style'],
  (element) => {
    if (element.style.display === 'block') {
      element.style.transform = 'translate(60px,0px)'
    } else {
      element.style.transform = 'translate(-260px,0px)'
    }
  }
)
