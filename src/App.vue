<template>
  <Navigator />
  <Screenshot />
  <a-layout>
    <a-layout-content><Workspace /><Toolbox /><Zoombox /></a-layout-content>
    <a-layout-sider
      ref="codespace"
      :resize-directions="['left']"
      @moving="handleMoving"
      @moving-end="handleMoving"
    >
      <Codespace />
    </a-layout-sider>
  </a-layout>
</template>

<script setup>
import './assets/categories'
import './blocks/boxy'
import './blocks/patch'
import './theme/codemao.theme'
import './theme/codemao.renderer'
import './generators/javascript'

import Blockly from 'blockly'
import { onMounted, ref, watch } from 'vue'

import Codespace from './components/Codespace.vue'
import Navigator from './components/Navigator.vue'
import Screenshot from './components/Screenshot.vue'
import Toolbox from './components/Toolbox.vue'
import Workspace from './components/Workspace.vue'
import Zoombox from './components/Zoombox.vue'
import { useStore } from './utils/store'

const store = useStore()
const codespace = ref()
let usedCodespace = null

function handleMoving() {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      Blockly.svgResize(store.workspace)
    }, 100 * i)
  }
}

function setCodespace(isOpen = false) {
  codespace.value.$el.style.display = isOpen ? 'block' : 'none'
  handleMoving()
}

onMounted(() => {
  watch(
    store.$state,
    (state) => {
      if (state.hasCodespace !== usedCodespace) {
        setCodespace(state.hasCodespace)
        usedCodespace = state.hasCodespace
      }
    },
    { deep: true }
  )
  handleMoving()
  setCodespace()
})
</script>

<style>
* {
  transition:
    color ease 50ms,
    background-color ease 200ms,
    border ease 300ms;
}

html,
body,
#app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;

  background: var(--color-bg-1);
  border: 0;
}

body::-webkit-scrollbar {
  display: none;
}
</style>
