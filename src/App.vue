<template>
  <a-layout>
    <a-layout-content>
      <Workspace />
      <Toolbox />
      <Zoombox />
    </a-layout-content>
    <a-layout-sider
      ref="layoutSider"
      :resize-directions="['left']"
      @moving="handleMoving"
      @moving-end="handleMoving"
    >
      <Codespace />
    </a-layout-sider>
  </a-layout>
  <Navigator />
  <Trashcan />
  <Screenshot />
  <Dialog />
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
import Dialog from './components/Dialog.vue'
import Navigator from './components/Navigator.vue'
import Screenshot from './components/Screenshot.vue'
import Toolbox from './components/Toolbox.vue'
import Trashcan from './components/Trashcan.vue'
import Workspace from './components/Workspace.vue'
import Zoombox from './components/Zoombox.vue'
import { useStore } from './utils/store'

const store = useStore()
const layoutSider = ref()
let usedLayoutSider

function handleMoving() {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      Blockly.svgResize(store.workspace)
    }, 100 * i)
  }
}

function setLayoutSider(isOpen = false) {
  layoutSider.value.$el.style.display = isOpen ? 'block' : 'none'
  handleMoving()
}

onMounted(() => {
  watch(
    store.$state,
    (state) => {
      if (state.hasLayoutSider !== usedLayoutSider) {
        setLayoutSider(state.hasLayoutSider)
        usedLayoutSider = state.hasLayoutSider
      }
    },
    { deep: true }
  )
  handleMoving()
  setLayoutSider()
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
